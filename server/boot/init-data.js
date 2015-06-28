var async = require('async');

module.exports = function (app) {

  var Tag = app.models.Tag;
  var Item = app.models.Item;
  var Person = app.models.Person;

  function destroyData() {
    var models = [Tag, Item, Person];
    async.each(models, function (model) {
      console.log('Clearing %s data', model.modelName);
      model.destroyAll();
    });
  }

  function createPeople(ammount) {
    for (var i = 1; i <= ammount; i++) {
      var newPerson = {
        name: "Person " + i,
        email: "person" + i + "@example.com"
      };
      Person.create(newPerson, function (err, res) {
        if (err) console.log(err);
        console.log('Created Person with id ' + res.id);
      });
    }
  }

  function createItems(ammount) {
    for (var i = 1; i <= ammount; i++) {
      var newItem = {
        name: 'Item name ' + i,
        description: 'Item description ' + i,
        personId: i,
        tagIds: ['1', '2']
      };
      Item.create(newItem, function (err, res) {
        if (err) console.log(err);
        console.log('Created Item with id ' + res.id);
      });
    }
  }

  function createTags(ammount) {
    for (var i = 1; i <= ammount; i++) {
      var newTag = {
        name: "Tag" + i,
        description: "Tag description " + i
      };
      Tag.create(newTag, function (err, res) {
        if (err) console.log(err);
        console.log('Created Tag with id ' + res.id);
      });
    }
  }

  async.series([
      destroyData(),
      createTags(3),
      createPeople(3),
      createItems(30)
    ], function (err, results) {
      if (err) console.log(err);
      console.log(results);
    }
  )

};
