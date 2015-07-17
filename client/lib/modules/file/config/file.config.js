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
    controller: function (Container, containers) {
      this.containers = containers;
      this.addContainer = function () {
        var name = window.prompt('Container name?');

        if (name !== null) {
          Container.createContainer({
            name: name
          }).$promise.then(function(){
            console.log('name', name);
          }).catch(function(err){
            console.log('err', err);
          });
        }
      }
    },
    resolve: {
      containers: function (Container) {
        return Container.getContainers().$promise;
      }
    }
  }).state('app.files.upload', {
    url: '/upload/:container',
    templateUrl: 'lib/modules/file/views/upload.html',
    resolve: {
      containers: function (Container) {
        return Container.getContainers().$promise;
      },
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
    controller: function ($stateParams, File, containers, container) {
      this.container = container;
      this.upload = {
        container: $stateParams.container,
        file: {}
      };

      this.containerList = containers.map(function(container){
        return {
          value: container.name,
          label: container.name
        }
      });

      this.schema = {
        type: 'object',
        properties: {
          container: {
            type: 'string',
            format: 'uiselect',
            title: 'Container',
            items: this.containerList
          },
          file: {
            type: 'file',
            title: 'File'
          }
        }
      };

      this.form = [{
        key: 'container'
      }, {
        key: 'file',
        type: 'file'
      }, {
        type: 'submit',
        title: 'Submit'
      }];

      this.onSubmit = function () {
        console.log('this.upload', this.upload);

        File.upload(this.upload, function (yay) {
          console.log('yay', yay);
        }, function (nay) {
          console.log('nay', nay);
        });

      };

    },
    controllerAs: 'ctrl'
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
