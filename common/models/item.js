var csv = require('csv');

module.exports = function (Item) {

  Item.export = function (res, cb) {
    Item.find()
      .then(function (items) {
        var content = items.map(function (item) {
          return {
            id: item.id,
            name: item.name,
            status: item.status
          }
        });
        var options = {
          header: true,
          delimiter: ';'
        };
        csv.stringify(content, options, function (err, csv) {
          if (err) cb(err);
          cb(null, csv);
        });
      })
      .catch(cb);
  };


  Item.afterRemote('export', function (ctx, data, next) {
    var filename = 'items-export.' + new Date().getTime() + '.csv';
    ctx.res.attachment(filename);
    ctx.res.send(data);
    ctx.res.end();
  });


};
