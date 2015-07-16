var app = angular.module('app.file', []);

app.config(function ($stateProvider) {
  $stateProvider.state('app.files', {
    url: '/files',
    abstract: true,
    template: '<ui-view></ui-view>'
  }).state('app.files.list', {
    url: '/list',
    templateUrl: 'lib/modules/file/views/list.html',
    controllerAs: 'ctrl',
    controller: function (containers) {
      this.containers = containers;
    },
    resolve: {
      containers: function (Container) {
        return Container.getContainers().$promise;
      }
    }
  }).state('app.files.container', {
    url: '/container/:container',
    templateUrl: 'lib/modules/file/views/container.html',
    resolve: {
      container: function ($stateParams, Container) {
        return Container.getContainer({
          container: $stateParams.container
        }).$promise;
      },
      files: function ($stateParams, Container) {
        return Container.getFiles({
          container: $stateParams.container
        }).$promise;
      }
    },
    controller: function (container, files) {
      this.container = container;
      this.files = files;
    },
    controllerAs: 'ctrl'
  }).state('app.files.file', {
    url: '/container/:container/files/:file',
    templateUrl: 'lib/modules/file/views/file.html',
    resolve: {
      container: function ($stateParams, Container) {
        return Container.getContainer({
          container: $stateParams.container
        }).$promise;
      },
      file: function ($stateParams, Container) {
        return Container.getFile({
          container: $stateParams.container,
          file: $stateParams.file
        }).$promise;
      }
    },
    controller: function (container, file) {
      this.container = container;
      this.file = file;
    },
    controllerAs: 'ctrl'
  }).state('app.files.download', {
    url: '/container/:container/download/:file',
    template: '<pre>{{ctrl.download}}</pre>',
    resolve: {
      download: function ($stateParams, Container) {
        return Container.download({
          container: $stateParams.container,
          file: $stateParams.file,
          res: {}
        }).$promise;
      }
    },
    controller: function (download) {
      this.download = download;
    },
    controllerAs: 'ctrl'
  });
});
