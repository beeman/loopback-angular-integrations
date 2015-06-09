var app = angular.module('app');
app.controller('ItemListCtrl', function ($scope, $state, Item, items) {

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

});
