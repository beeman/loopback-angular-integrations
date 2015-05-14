var app = angular.module('app', [
  'lbServices',
  'ui.select',
  'ui.router',
  'pascalprecht.translate',
  'schemaForm'
]);

app.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        template: '<ui-view></ui-view>'
      })
      .state('app.items', {
        url: '/items',
        templateUrl: 'views/items.html',
        controller: function (items) {
          this.items = items;
        },
        controllerAs: 'ctrl',
        resolve: {
          items: function (Item) {
            return Item.find({
              filter: {
                include: ['tags']
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
            return Item.findById({id: $stateParams.itemId}).$promise;
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
