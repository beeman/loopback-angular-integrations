var app = angular.module('app', [
  'angularDui',
  'lbServices',
  'schemaForm',
  'angular-underscore/filters',
  'ui.select',
  'ui.router',
  'ui.bootstrap',
  'smart-table',
  'ngCsv',
  'pascalprecht.translate'
]);

app.run(function ($rootScope, DuiConfig) {
  var appName = 'Integrations';
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
    sidebar: {},
    main: {
      class: 'col-md-12'
    },
    footer: {
      text: '<a href="https://github.com/beeman/loopback-angular-integrations">loopback-angular-integrations</a> by <a href="https://github.com/beeman">beeman</a>'
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
        controller: 'ItemListCtrl',
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
  // Nothing to control here :)
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
    template: '<input type="checkbox" ng-model="isAllSelected"/>',
    scope: {
      rows: '=csSelectAll'
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
