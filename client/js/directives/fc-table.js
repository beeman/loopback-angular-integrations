var app = angular.module('fc.table', ['smart-table', 'schemaForm']);

app.directive('fcTable', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      config: '='
    },
    templateUrl: 'js/directives/fc-table.html',
    controllerAs: 'table',
    controller: function ($scope, $timeout) {

      var self = this;

      // Copy the config passed in the directive
      this.config = $scope.config;

      // Here we store the smart-table state
      this.tableState = {};

      // Here we store the state of this directive
      this.state = {
        request: {
          skip: 0,
          limit: this.config.itemsPerPage,
          include: this.config.includeModels,
          searchTerms: [],
          sortOrder: {}
        },
        counters: {
          itemsPerPage: this.config.itemsPerPage
        },
        selectedIds: [],
        paginated: [],
        items: []
      };

      // Loading timeout
      this.loadingTimeout = this.config.loadingTimeout || 0;

      // The model that holds the search values
      this.searchModel = {};

      // Advanced search visibility
      this.showSearch = false;

      // Toggle advanced search
      this.toggleSearch = function () {
        this.showSearch = !this.showSearch;
      };

      // Loading indicator
      this.isLoading = true;

      // Select all in filter
      this.itemsSelectedAll = false;

      // Toggle select all in filter
      this.toggleSelectAll = function () {
        this.itemsSelectedAll = !this.itemsSelectedAll;

        if (this.itemsSelectedAll) {
          this.getAllSelectedIds().then(function (ids) {
            self.state.selectedIds = ids;
          });
        }

      };

      this.refresh = function refresh() {
        if(!self.isLoading){
          this.getData(self.tableState);
        }
      };

      /**
       * Method that gets called from the view
       */
      this.getData = function getData(tableState) {

        // Copy the tableState
        self.tableState = tableState;

        // Start loading indicator
        self.isLoading = true;
        console.log('Loading Start');

        // Set skip
        self.setPaginateSkip();

        // Set limit
        self.setPaginateLimit();

        // Set search terms
        self.setSearchTerms();

        // Set sort order
        self.setSortOrder();

        $timeout(function () {

          self.getPaginatedData().then(function (paginated) {

            // Update the paginated state
            self.updatePaginateState(paginated);

            // Stop loading indicator
            self.isLoading = false;

            console.log('Loading End');
          });

        }, self.loadingTimeout);

      };

      this.getAllSelectedIds = function setPaginated() {
        // Make the API request

        // Copy request and remove skip/limit
        var request = self.state.request;
        request.skip = 0;
        request.limit = self.state.counters.itemsTotal;

        return self.config.model.paginate(request)
          .$promise.then(function (result) {
            return result.items.map(function (item) {
              return item.id
            });
          }).then(function (itemIds) {
            return itemIds;
          });
      };


      /**
       *
       * @returns {*|promise|n}
       */
      this.getPaginatedData = function setPaginated() {
        // Make the API request
        return self.config.model.paginate(self.state.request).$promise
      };

      // Determine and set the 'skip' value
      this.setPaginateSkip = function setPaginateSkip() {
        if (self.tableState.pagination && self.tableState.pagination.start) {
          self.state.request.skip = self.tableState.pagination.start;
        } else {
          self.state.request.skip = 0;
        }
      };

      // Determine and set the 'limit' value
      this.setPaginateLimit = function setPaginateLimit() {
        if (self.config.itemsPerPage === 'all') {
          self.config.itemsPerPage = null;
        }
        self.state.request.limit = self.config.itemsPerPage;
      };


      /**
       * Collect the search terms
       */
      this.setSearchTerms = function setSearchTerms() {
        // Get search fields
        if (self.searchModel) {
          self.state.request.searchTerms = self.searchModel;
        }

        // Get quick search
        if (self.tableState.search && self.tableState.search.predicateObject) {
          self.state.request.searchTerms['*'] = self.tableState.search.predicateObject['$'];
        }
      };

      // Collect the sort order
      this.setSortOrder = function setSearchTerms() {
        // Define sort order
        self.state.request.sortOrder = self.tableState.sort;
      };

      /**
       * Update the paginatedState object based on API results
       */
      this.updatePaginateState = function updatePaginateState(paginated) {

        // Update the counters
        self.state.counters = paginated.counters;

        // Update the smart tables pagination.
        self.updateTableStatePagination();

        // Update the items
        self.state.paginated = paginated.items;
        self.state.items = [].concat(self.state.paginated);

      };


      /**
       * Update the tableState pagination values with the counters from the results
       */
      this.updateTableStatePagination = function updateTableStatePagination() {
        self.tableState.pagination = {
          start: self.state.counters.itemsFrom,
          number: self.state.counters.itemsPerPage,
          numberOfPages: self.state.counters.pageTotal
        };
      };

      // Watch these items and add the selected ones to a new array
      $scope.$watch(angular.bind(this, function () {
        return self.state.items;
      }), function (newItems) {
        self.state.selectedIds = newItems.filter(function (item) {
          return item.isSelected;
        }).map(function (item) {
          return item.id;
        })
      }, true);

      $scope.$watch(angular.bind(this, function () {
        return self.state.request.searchTerms;
      }), function () {
        self.refresh();
      }, true);

      $scope.$watch(angular.bind(this, function () {
        return self.state.request.sortOrder;
      }), function () {
        self.refresh();
      }, true);

      $scope.$watch(angular.bind(this, function () {
        return self.config.itemsPerPage;
      }), function () {
        self.refresh();
      }, true);


    }
  };
});

app.directive('fcSelect', function () {
  return {
    require: '^stTable',
    template: '<input type="checkbox"/>',
    scope: {
      row: '=fcSelect'
    },
    link: function (scope, element, attr, ctrl) {

      element.bind('change', function (evt) {
        scope.$apply(function () {
          ctrl.select(scope.row, 'multiple');
        });
      });

      scope.$watch('row.isSelected', function (newValue, oldValue) {
        if (newValue === true) {
          element.parent().addClass('fc-selected-row');
          element.children()[0].checked = true;
        } else {
          element.parent().removeClass('fc-selected-row');
          element.children()[0].checked = false;
        }
      });
    }
  };
});

app.directive('fcSelectAll', function () {
  return {
    require: '^stTable',
    template: '<input type="checkbox" ng-model="isAllSelected"/>',
    scope: {
      rows: '=fcSelectAll'
    },
    link: function (scope) {

      function getAllSelected() {
        return (getTotalRows() === getSelectedRows());
      }

      function getTotalRows() {
        return scope.rows.length;
      }

      function getSelectedRows() {
        var selectedRows = 0;
        scope.rows.forEach(function (row) {
          if (row.isSelected) {
            selectedRows++;
          }
        });
        return selectedRows;
      }

      function setAllRows(bool) {
        scope.rows.forEach(function (row) {
          if (!row.isSelected == bool) {
            row.isSelected = bool;
          }
        });
      }

      scope.$watch('rows', function () {
        scope.isAllSelected = getAllSelected();
      }, true);

      scope.$watch('isAllSelected', function () {
        if (scope.isAllSelected) {
          setAllRows(true);
        } else {
          if (getAllSelected()) {
            setAllRows(false);
          }
        }
      });

    }
  };
});
