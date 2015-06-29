var app = angular.module('app');
app.controller('ItemEditCtrl', function ($scope, $state, Item, tags, item, people) {

  this.tags = tags;
  this.item = item;
  this.people = people;
  this.statuses = [
    {value: 'new', label: 'New'},
    {value: 'old', label: 'Old'}
  ];

  this.formSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        title: 'Name'
      },
      description: {
        type: 'string',
        title: 'Description'
      },
      status: {
        type: 'string',
        format: 'uiselect',
        title: 'Status',
        items: this.statuses
      },
      personId: {
        type: 'string',
        format: 'uiselect',
        title: 'Person',
        items: this.people
      },
      tagIds: {
        type: 'array',
        format: 'uiselect',
        title: 'Tags',
        items: this.tags
      }
    }
  };

  this.form = [{
    key: 'name',
    type: 'string'
  }, {
    key: 'description',
    type: 'textarea'
  }, {
    key: 'status',
    placeholder: 'Select the status'
  }, {
    key: 'personId',
    placeholder: 'Select one person'
  }, {
    key: 'tagIds',
    placeholder: 'Select one or more tags'
  }, {
    type: 'submit',
    title: 'Submit'
  }
  ];

  this.onSubmit = function () {
    this.item.person = null;
    Item
      .upsert(this.item)
      .$promise
      .then(
      function (result) {
        window.alert('Your item has been saved!');
        $state.go('app.items.list');
      }
    );
  };

});
