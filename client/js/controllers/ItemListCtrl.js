var app = angular.module('app');
app.controller('ItemListCtrl', function ($scope, $state, $modal, $document,
                                         $timeout, Item, items) {

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


  this.handleChangeStatus = function () {
    this.setItemStatus(this.getSelectedIds(),
      window.prompt('Enter the new status'));
  };

  this.handleDelete = function () {
    if (window.confirm('Are you sure?')) {
      this.deleteItems(this.getSelectedIds());
    }
  };

  this.handleDuplicate = function () {
    this.duplicateItems(this.itemsSelected);
  };

  this.handleArchive= function () {
    this.archiveItems(this.getSelectedIds());
  };

  this.handleExport = function () {
    var datestamp = new Date().getTime();
    var options = {
      filename: 'item-export-' + datestamp + '.csv',
      fields: ['id', 'name', 'status']
    };

    Item.export({
      fields: options.fields,
      idList: this.getSelectedIds()
    }).$promise
      .then(function (res) {
        self.pushDownload(res.csv, options.filename);
      });
  };

  this.setItemStatus = function (itemIds, newStatus) {
    Item.updateAll({where: {id: {inq: itemIds}}}, {status: newStatus}).$promise.then(function () {
      $state.go($state.current, {}, {reload: true})
    });
  };

  this.deleteItems = function (itemIds) {
    itemIds.map(function (itemId) {
      return Item.deleteById({id: itemId}).$promise.then(function () {
        $state.go($state.current, {}, {reload: true})
      });
    });
  };

  this.duplicateItems = function (items) {
    items.map(function (item) {
      delete item.id;
      delete item.isSelected;
      return Item.create(item).$promise.then(function () {
        $state.go($state.current, {}, {reload: true})
      });
    });
  };

  this.archiveItems = function(itemIds) {
    Item.updateAll({where: {id: {inq: itemIds}}}, {archived: true}).$promise.then(function () {
      $state.go($state.current, {}, {reload: true})
    });
  };

  this.exportItems = function (items) {
    var itemIds = items.map(function (item) {
      return item.id;
    });
    return Item.export().$promise.then(function () {
      $state.go($state.current, {}, {reload: true});
    });
  };

  this.getCsvName = 'items-export.csv';

  this.getCsv = function () {
    var timestamp = new Date().getTime();
    this.getCsvName = 'items-export.' + timestamp + '.csv';
    return this.itemsSelected.map(function (item) {
      return {
        id: item.id,
        name: item.name,
        status: item.status,
        description: item.description
      };
    });
  };

  this.getCsvHeader = function () {
    return ['ID', 'Name', 'Status', 'Description'];
  };

  this.getSelectedIds = function () {
    return this.itemsSelected.map(function (item) {
      return item.id;
    })
  };

  this.export = function () {
  };

  this.pushDownload = function (data, filename, mimetype, charset) {
    filename = filename || 'export.csv';
    mimetype = mimetype || 'text/csv';
    charset = charset || 'utf-8';

    var blob = new Blob([data], {
      type: mimetype + ';charset=' + charset + ';'
    });

    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      var downloadLink = angular.element('<a></a>');
      downloadLink.attr('href', window.URL.createObjectURL(blob));
      downloadLink.attr('download', filename);
      downloadLink.attr('target', '_blank');

      $document.find('body').append(downloadLink);
      $timeout(function () {
        downloadLink[0].click();
        downloadLink.remove();
      }, null);
    }
  };

  this.modalExport = function () {
    $modal.open({
      templateUrl: 'modalExport.html',
      controllerAs: 'ctrl',
      controller: function ($modalInstance) {
        this.export = {
          filename: self.getCsvName,
          headers: true,
          fields: [{
            name: 'id',
            label: 'ID',
            selected: false
          }, {
            name: 'name',
            label: 'Name',
            selected: true
          }, {
            name: 'status',
            label: 'Status',
            selected: true
          }, {
            name: 'description',
            label: 'Description',
            selected: true
          }]
        };

        this.exportCsv = function () {
          $modalInstance.close();
          return self.handleCsvExport(this.export);
        };

        this.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      }
    });
  };

});
