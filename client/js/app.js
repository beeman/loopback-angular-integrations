var app = angular.module('app', [
  'angularDui',
  'lbServices',
  'schemaForm',
  'angular-underscore/filters',
  'ui.select',
  'ui.router',
  'smart-table',
  'pascalprecht.translate'
]);

app.run(function ($rootScope, DuiConfig) {
  var appName = 'loopback-angular-schema-form';
  var appNavitems = [
    {label: 'Items', href: '#/app/items'}
  ];
  var appConfig = {
    app: {
      name: appName,
      container: true
    },
    header: {
      nav: {
        class: 'navbar navbar-inverse navbar-fixed-top',
        container: true,
        title: appName,
        href: '#/',
        items: appNavitems
      }
    },
    sidebar: {
      class: 'col-md-2',
      items: appNavitems
    },
    main: {
      class: 'col-md-10'
    },
    footer: {
      text: '<a href="https://github.com/beeman/angular-dui">angular-dui</a> by <a href="https://github.com/beeman">beeman</a>'
    }
  };

  DuiConfig.setConfig(appConfig);

  // TODO: the config should be dynamically handled by a service
  $rootScope.dui = appConfig;
});


app.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'views/app.html',
        controller: 'AppCtrl'
      })
      .state('app.items', {
        url: '/items',
        templateUrl: 'views/items.html',
        controller: function ($scope, items) {
          var self = this;

          // The array of items we work with
          this.items = items;

          // The array of selected items
          this.itemsSelected = [];

          // Watch these items and add the selected ones to a new array
          $scope.$watch(angular.bind(this, function (items) {
            return this.items;
          }), function (newItems) {
            self.itemsSelected = newItems.filter(function (item) {
              return item.isSelected;
            })
          }, true);

          // The available batch operations
          this.batchOperations = [{
            value: '',
            label: 'Select batch operation',
            disable: true
          }, {
            value: 'delete',
            label: 'Delete'
          }, {
            value: 'duplicate',
            label: 'Duplicate'
          }];

          // The selected batch operation
          this.batchOperation = "";

          // The action to run with the batch operations
          this.applyBatchOperation = function () {

            // Check if there are items selected
            if (this.itemsSelected.length < 1) {
              window.alert('Please select one ore more items');
              return;
            }
            console.log('Selected items:', this.itemsSelected);

            // Check if there is a batch operation selected
            if (this.batchOperation === "") {
              window.alert('Please pick batch operation');
              return;
            }
            console.log('Selected batch operation:', this.batchOperation);

            this.runBatchOperations(this.batchOperation, this.itemsSelected);
          };

          // This runs the actual operation on the items
          this.runBatchOperations = function (action, items) {
            window.alert('Running ' + action + ' on ' + items.length + ' items');
          };

        },
        controllerAs: 'ctrl',
        resolve: {
          items: function (Item) {
            return Item.find({
              filter: {
                include: ['tags', 'person']
              }
            }).$promise;
          }
        }
      })
      .state('app.edit', {
        url: '/edit/:itemId',
        templateUrl: 'views/form.html',
        controller: 'ItemEditCtrl',
        controllerAs: 'ctrl',
        resolve: {
          item: function ($stateParams, Item) {
            return Item.findById({
              id: $stateParams.itemId
            }).$promise.then(function (res) {
                res.personId = res.personId + "";
                return res;
              });
          },
          people: function (Person) {
            return Person.find().$promise.then(function (people) {
              var result = [];
              people.map(function (person) {
                result.push({
                  value: person.id.toString(),
                  label: person.name,
                  description: person.email
                });
              });
              return result;
            });
          },
          tags: function (Tag) {
            return Tag.find().$promise.then(function (tags) {
              var result = [];
              tags.map(function (tag) {
                result.push({
                  value: tag.id,
                  label: tag.name,
                  description: tag.description
                });
              });
              return result;
            });
          }
        }
      })
      .state('app.add', {
        url: '/add',
        templateUrl: 'views/form.html',
        controller: 'ItemEditCtrl',
        controllerAs: 'ctrl',
        resolve: {
          item: function () {
            return {};
          },
          people: function (Person) {
            return Person.find().$promise.then(function (people) {
              var result = [];
              people.map(function (person) {
                result.push({
                  value: person.id.toString(),
                  label: person.name,
                  description: person.email
                });
              });
              return result;
            });
          },
          tags: function (Tag) {
            return Tag.find().$promise.then(function (tags) {
              var result = [];
              tags.map(function (tag) {
                result.push({
                  value: tag.id,
                  label: tag.name,
                  description: tag.description
                });
              });
              return result;
            });
          }
        }
      });

    $urlRouterProvider.otherwise('/app/items');
  }]);


app.controller('AppCtrl', function ($scope) {
  $scope.pageTitle = 'loopback-angular-schema-form';
});

app.directive('csSelect', function () {
  return {
    require: '^stTable',
    template: '<input type="checkbox"/>',
    scope: {
      row: '=csSelect'
    },
    link: function (scope, element, attr, ctrl) {

      element.bind('change', function (evt) {

        console.log(ctrl.tableState());

        scope.$apply(function () {
          ctrl.select(scope.row, 'multiple');
        });
      });

      scope.$watch('row.isSelected', function (newValue, oldValue) {
        if (newValue === true) {
          element.parent().addClass('st-selected');
          element.children()[0].checked = true;
        } else {
          element.parent().removeClass('st-selected');
          element.children()[0].checked = false;
        }
      });
    }
  };
});

app.directive('csSelectAll', function () {
  return {
    require: '^stTable',
    template: '<input type="checkbox"/>',
    scope: {
      rows: '=csSelectAll'
    },
    link: function (scope, element, attr, ctrl) {
      element.bind('change', function (evt) {
        scope.rows.forEach(function(row){
          scope.$apply(function () {
            ctrl.select(row, 'multiple');
          });
        });
      });
    }
  };
});
