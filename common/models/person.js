module.exports = function(Person) {

  Person.validatesUniquenessOf('name', {message: 'name is not unique'});

};
