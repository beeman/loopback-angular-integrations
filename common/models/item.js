var csv = require('csv');

module.exports = function (Item) {

  Item.export = function (data, cb) {

    var headers = data.headers || true;
    var delimiter = data.delimiter || ';';

    var result = {
      err: null,
      csv: null
    };

    var filter = {};

    if (data.idList && data.idList.length) {
      filter.where = {
        id: {
          inq: data.idList
        }
      }
    }

    if (data.fields) {
      filter.fields = {};
      data.fields.map(function (field) {
        filter.fields[field] = true;
      })
    }
    Item.find(filter).then(function (items) {
      var content = items.map(function (item) {
        var res = {};
        data.fields.map(function (field) {
          res[field] = item[field];
        });

        return res;
      });
      var options = {
        header: headers,
        delimiter: delimiter
      };
      csv.stringify(content, options, function (err, csv) {
        result.err = err;
        result.csv = csv;
        cb(null, result);
      });
    })
      .catch(cb);
  };

};
