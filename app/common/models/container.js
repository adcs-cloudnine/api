var path = require('path');
var app = require(path.resolve(__dirname, '../../'));
var Log = require('log');
var log = new Log('info');

module.exports = function(Container) {
  Container.beforeRemote('**', function(context, unused, next) {
    if (context.methodString === 'container.upload') {
      var Post = app.models.Post;
      var userId = context.req.query.userId;
      var rating = context.req.query.rating;

      //console.log(context.method.ctor.getFiles);
      //console.log(context.req);

      //Post.create({ user_id: userId, rating: rating }, function(err, post) {
      //  next();
      //});
      next();
    } else {
      next();
    }
  });
};