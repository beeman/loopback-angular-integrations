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
    {label: 'Items', href: '#/app/items/list'}
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
        abstract: true,
        template: '<ui-view></ui-view>'
      }).state('app.items.list', {
        url: '/list',
        template: '<fc-table config="ctrl.config"></fc-table>',
        controllerAs: 'ctrl',
        controller: function ($state, $window, Item) {
          this.config = {
            model: Item,
            itemsPerPage: 5,
            debug: true,
            loadingTimeout: 250,
            includeModels: [
              'person',
              'tags'
            ],
            columns: [{
              field: 'name',
              sortField: 'name',
              class: 'sorting col-md-2',
              label: 'Name',
              click: function (item) {
                $state.go('app.items.view', {itemId: item.id});
              }
            }, {
              field: 'status',
              sortField: 'status',
              class: 'sorting col-md-2',
              label: 'Status'
            }, {
              field: 'description',
              sortField: 'description',
              class: 'sorting col-md-3 text-nowrap',
              label: 'Description'
            }, {
              field: 'person',
              sortField: 'personId',
              relatedField: 'name',
              class: 'sorting col-md-3 text-nowrap',
              label: 'Person'
            }],
            topButtons: [{
              label: '',
              icon: 'fa fa-plus',
              class: 'btn btn-default btn-sm',
              show: true,
              click: function () {
                $state.go('app.items.add');
              }
            }],
            rowButtons: [{
              label: 'View',
              class: 'btn btn-default btn-xs',
              click: function (item) {
                $state.go('app.items.view', {itemId: item.id});
              }
            }, {
              label: '',
              class: 'btn btn-default btn-xs',
              icon: 'fa fa-pencil',
              click: function (item) {
                $state.go('app.items.edit', {itemId: item.id});
              }
            }, {
              label: '',
              class: 'btn btn-default btn-xs',
              icon: 'fa fa-trash',
              click: function (item) {
                if($window.confirm('Are you sure?')) {
                  Item.delete({id: item.id}).$promise.then(function(res){
                    $state.reload();
                  })
                }
              }
            }],
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
        }
      })
      .state('app.items.old', {
        url: '/old',
        templateUrl: 'views/items.html',
        controller: 'ItemListOldCtrl',
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
      .state('app.items.edit', {
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
      .state('app.items.view', {
        url: '/view/:itemId',
        template: '<pre>{{ctrl.item|json}}</pre>',
        resolve: {
          item: function ($stateParams, Item) {
            return Item.findById({
              id: $stateParams.itemId
            }).$promise.then(function (res) {
              return res;
            });
          }
        },
        controller: function(item){
          this.item = item;
        },
        controllerAs: 'ctrl'
      })
      .state('app.items.add', {
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

    $urlRouterProvider.otherwise('/app/items/list');
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
