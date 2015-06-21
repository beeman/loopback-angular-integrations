var csv = require('csv');

module.exports = function (Item) {

  Item.changeName = function(changes) {
    console.log('changeName: idList:', changes.getIdList());
    console.log('changeName: valueList:', changes.getValueList());
  };

  Item.changeStatus = function(changes) {
    console.log('changeStatus: idList:', changes.getIdList());
    console.log('changeStatus: valueList:', changes.getValueList());
  };

  // Set the status to 'archived'
  Item.changeArchived = function(changes) {
    Item.updateAll({
      id: {
        inq: changes.getIdList()
      }
    }, {
      archived: true,
      status: 'archived'
    }).then(function(res){
      console.log('changeArchived: ', res);
    }).catch(function(err){
      console.log('changeArchived: err: ', err);
    });
  };

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
