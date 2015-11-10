var path = require('path');
var app = require(path.resolve(__dirname, '../../'));
var Log = require('log');
var log = new Log('info');

function Container() {

}

Container.saveImagePost = function(req, part) {
  var filename = part.filename;
  var userId = req.query.userId;
  var rating = req.query.rating;
  var Post = app.models.Post;

  log.info('Container.saveImagePost - called');
  log.info('Container.saveImagePost - userId:', userId);
  log.info('Container.saveImagePost - rating:', rating);
  log.info('Container.saveImagePost - query:', req.query);

  var postData = {
    user_id: userId,
    rating: rating,
    images: {
      small: 'http://' + req.headers.host + '/containers/posts/download/' + filename,
      medium: 'http://' + req.headers.host + '/containers/posts/download/' + filename,
      large: 'http://' + req.headers.host + '/containers/posts/download/' + filename
    }
  };

  Post.create(postData, function(err, post) {
    //console.log(post);
  });
};

module.exports = Container;