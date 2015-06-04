var app = angular.module('app');
app.controller('ItemListCtrl', function ($scope, items) {

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

    // Check if there is a batch operation selected
    if (this.batchOperation === "") {
      window.alert('Please pick batch operation');
      return;
    }

    this.runBatchOperations(this.batchOperation, this.itemsSelected);
  };

  // This runs the actual operation on the items
  this.runBatchOperations = function (action, items) {
    window.alert('Running ' + action + ' on ' + items.length + ' items');
  };


});
