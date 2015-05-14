var app = angular.module('app');
app.controller('ItemEditCtrl', function ($scope, $state, Item, tags, item) {

  this.tags = tags;
  this.item = item;

  this.formSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        title: 'Text'
      },
      description: {
        type: 'string',
        title: 'Description'
      },
      tagIds: {
        type: 'array',
        format: 'uiselect',
        title: 'Tags',
        placeholder: 'This is the placeholder for tags',
        items: tags
      }
    }
  };

  this.form = [
    {
      key: 'name',
      type: 'string'
    },
    {
      key: 'description',
      type: 'textarea'
    },
    {
      key: 'tagIds'
    },
    {
      type: 'submit',
      title: 'Submit'
    }
  ];

  this.onSubmit = function () {
    Item
      .upsert(this.item)
      .$promise
      .then(
      function (result) {
        window.alert('Your item has been saved!');
        $state.go('app.items');
      }
    );
  };

});
