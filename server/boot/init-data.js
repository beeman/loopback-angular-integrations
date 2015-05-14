module.exports = function(app) {

  var Tag = app.models.Tag;

  for(var i = 0; i < 10; i++) {

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

  for(var i = 0; i < 10; i++) {

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

};
