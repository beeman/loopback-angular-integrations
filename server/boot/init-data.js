module.exports = function(app) {

  var Tag = app.models.Tag;

  for(var i = 1; i < 10; i++) {

    var newTag = {
      name: "Tag" + i,
      description: "Tag description " + i
    };

    Tag.create(newTag, function(err, createdTag){
      if(err) console.log(err);
      console.log('Created', createdTag);
    });
  }

  var Item = app.models.Item;

  for(var i = 1; i < 10; i++) {

    var newItem = {
      name: "Item name " + i,
      description: "Item description " + i,
      tagIds: ["1"]
    };

    Item.create(newItem, function(err, createdItem){
      if(err) console.log(err);
      console.log('Created', createdItem);
    });
  }

  var Person = app.models.Person;

  for(var i = 1; i < 10; i++) {

    var newPerson = {
      name: "Person " + i,
      email: "person" + i + "@example.com"
    };

    Person.create(newPerson, function(err, createdPerson){
      if(err) console.log(err);
      console.log('Created', createdPerson);
    });
  }

};
