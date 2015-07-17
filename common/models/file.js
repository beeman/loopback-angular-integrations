var CONTAINERS_URL = 'http://localhost:3000/api/containers/';

module.exports = function(File) {


  File.upload = function (ctx, options, cb) {

    var Container = File.app.models.Container;

    Container.upload(ctx.req, ctx.result, options, function(err, fileObj) {
      console.log('Upload called!');
      if (err) {
        console.log('err', err);
        cb(err);
      } else {
        console.log('no err');
        var fileInfo = fileObj.files.file[0];
        File.create({
          name: fileInfo.name,
          type: fileInfo.type,
          container: fileInfo.container,
          url: CONTAINERS_URL + fileInfo.container + '/download/' + fileInfo.name
        }, function (err, obj) {
          if (err !== null) {
            cb(err);
          } else {
            cb(null, obj);
          }
        });
      }
    });

  };

  File.remoteMethod('upload', {
      description: 'Uploads a file',
      accepts: [
        {arg: 'ctx', type: 'object', http: {source: 'context'}},
        {arg: 'options', type: 'object', http: {source: 'query'}}
      ],
      returns: {
        arg: 'fileObject', type: 'object', root: true
      },
      http: {verb: 'post'}
    }
  );
};
