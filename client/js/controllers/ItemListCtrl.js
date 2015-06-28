var app = angular.module('app');
app.controller('ItemListCtrl', function ($scope, $timeout, Item) {


  this.config = {
    model: Item,
    itemsPerPage: 5,
    includeModels: [
      'person',
      'tags'
    ],
    search: {
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: 'Name'
          },
          status: {
            type: 'string',
            title: 'Status'
          },
          description: {
            type: 'string',
            title: 'Description'
          }
        }
      },
      form: [{
        type: 'section',
        htmlClass: 'row',
        items: [{
          type: 'section',
          items: [{
            htmlClass: 'col-md-4',
            key: 'name'
          }, {
            htmlClass: 'col-md-4',
            key: 'status'
          }, {
            htmlClass: 'col-md-4',
            key: 'description'
          }]
        }]
      }]
    }
  };


  /**
   * Initialization
   */

  // Reference this controller
  var self = this;

  // Reference the model
  this.Model = self.config.model;

  // The items that get back from the controller
  this.paginatedItems = [];

  // Loading indicator
  this.isLoading = true;

  // Loading timeout
  this.loadingTimeout = 250;

  // Search form visible
  this.showSearch = false;

  // Toggle search form
  this.toggleSearch = function () {
    this.showSearch = !this.showSearch;
  };

  // Select all in filter
  this.itemsSelectedAll = false;

  // Toggle select all in filter
  this.toggleSelectAll = function () {
    this.itemsSelectedAll = !this.itemsSelectedAll;

    if (this.itemsSelectedAll) {
      self.getAllSelectedIds().then(function(ids){
        self.itemsSelected = ids;
      });
    }

  };

  // The array of selected items
  this.itemsSelected = [];

  // Watch these items and add the selected ones to a new array
  $scope.$watch(angular.bind(this, function (items) {
    return self.paginateState.items;
  }), function (newItems) {
    self.itemsSelected = newItems.filter(function (item) {
      return item.isSelected;
    }).map(function (item) {
      return item.id;
    })
  }, true);

  $scope.$watch(angular.bind(this, function (items) {
    return self.tableState;
  }), function () {
    self.getData(self.tableState);
  }, true);

  $scope.$watch(angular.bind(this, function (items) {
    return self.config.itemsPerPage;
  }), function () {
    self.getData(self.tableState);
  }, true);


  /**
   * The model that holds the search values
   */
  this.searchModel = {};

  /**
   * The model that holds the data returned from smart-table
   */
  this.tableState = {};

  /**
   * The model that holds the data for making the api request
   */
  this.paginateState = {
    request: {
      skip: 0,
      limit: self.config.itemsPerPage,
      include: self.config.includeModels,
      searchTerms: [],
      sortOrder: {}
    },
    counters: {
      itemsPerPage: self.config.itemsPerPage
    },
    items: []
  };


  /**
   * Method that gets called from the view
   */
  this.getData = function getData(tableState) {

    // Copy the tableState
    self.tableState = tableState;

    // Start loading indicator
    self.isLoading = true;

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

      });

    }, self.loadingTimeout);

  };


  this.getPaginatedData = function getPaginated() {
    // Make the API request
    return self.Model.paginate(self.paginateState.request).$promise
  };

  this.getAllSelectedIds = function getPaginated() {
    // Make the API request

    var request = self.paginateState.request;
    request.skip = 0;
    request.limit = self.paginateState.counters.itemsTotal;

    return self.Model.paginate(request).$promise.then(function (result) {
      return result.items.map(function (item) {
        console.log('item id', item.id);
        return item.id
      });
    }).then(function(itemIds){
      return itemIds;
    });
  };

  this.setPaginateSkip = function getPaginateSkip() {
    if (self.tableState.pagination && self.tableState.pagination.start) {
      self.paginateState.request.skip = self.tableState.pagination.start;
    } else {
      self.paginateState.request.skip = 0;
    }
  };

  this.setPaginateLimit = function getPaginateLimit() {

    if (self.config.itemsPerPage === 'all') {
      self.config.itemsPerPage = null;
    }
    self.paginateState.request.limit = self.config.itemsPerPage;

  };


  /**
   * Collect the search terms
   */
  this.setSearchTerms = function getSearchTerms() {
    // Get search fields
    if (self.searchModel) {
      self.paginateState.request.searchTerms = self.searchModel;
    }

    // Get quick search
    if (self.tableState.search && self.tableState.search.predicateObject) {
      self.paginateState.request.searchTerms['*'] = self.tableState.search.predicateObject['$'];
    }
  };

  // Collect the sort order
  this.setSortOrder = function getSearchTerms() {
    // Define sort order
    self.paginateState.request.sortOrder = self.tableState.sort;
  };

  /**
   * Update the paginatedState object based on API results
   */
  this.updatePaginateState = function updatePaginateState(paginated) {

    // Update the counters
    self.paginateState.counters = paginated.counters;

    // Update the smart tables pagination.
    self.updateTableStatePagination();

    // Update the items
    self.paginatedItems = paginated.items;
    self.paginateState.items = [].concat(self.paginatedItems);
  };


  /**
   * Update the tableState pagination values with the counters from the results
   */
  this.updateTableStatePagination = function updateTableStatePagination() {
    self.tableState.pagination = {
      start: self.paginateState.counters.itemsFrom,
      number: self.paginateState.counters.itemsPerPage,
      numberOfPages: self.paginateState.counters.pageTotal
    };

  };

});
