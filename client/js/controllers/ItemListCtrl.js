var app = angular.module('app');
app.controller('ItemListCtrl', function ($scope, $state, $modal, Item, items) {

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
    value: 'changeStatus',
    label: 'Change status'
  }, {
    value: 'delete',
    label: 'Delete'
  }, {
    value: 'duplicate',
    label: 'Duplicate'
  }, {
    value: 'export',
    label: 'Export'
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

    // Check if there is a batch operation selected
    if (this.batchOperation === "") {
      window.alert('Please pick batch operation');
      return;
    }

    this.runBatchOperations(this.batchOperation, this.itemsSelected);
  };

  // This runs the actual operation on the items
  this.runBatchOperations = function (action, items) {

    switch (action) {
      case 'changeStatus':
        this.setItemStatus(items, window.prompt('Enter the new status'));
        break;
      case 'delete':
        if (window.confirm('Are you sure?')) {
          this.deleteItems(items);
        }
        break;
      case 'duplicate':
        this.duplicateItems(items);
        break;
      case 'export':
        this.exportItems(items);
        break;
      default:
        window.alert('Running ' + action + ' on ' + items.length + ' items');
    }
  };

  this.setItemStatus = function (items, newStatus) {
    var itemIds = items.map(function (item) {
      return item.id;
    });

    Item.updateAll({where: {id: {inq: itemIds}}}, {status: newStatus}).$promise.then(function () {
      $state.go($state.current, {}, {reload: true})
    });
  };

  this.deleteItems = function (items) {
    items.map(function (item) {
      return Item.deleteById({id: item.id}).$promise.then(function () {
        $state.go($state.current, {}, {reload: true})
      });
    });
  };

  this.duplicateItems = function (items) {
    items.map(function (item) {
      delete item.id;
      return Item.create(item).$promise.then(function () {
        $state.go($state.current, {}, {reload: true})
      });
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

  this.handleCsvExport = function (options) {
    var fields = {};

    options.fields.map(function (field) {
      if (field.selected) {
        fields[field.name] = field.label;
      }
    });

    return Item.find({
      filter: {
        where: {
          id: {
            inq: this.getSelectedIds()
          }
        },
        fields: fields
      }
    }).$promise.then(function (res) {
        if (options.headers) {
          res.unshift(fields);
        }
        return res;
      });
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
