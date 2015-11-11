var path = require('path');
var app = require(path.resolve(__dirname, '../../'));
var Log = require('log');
var log = new Log('info');
var async = require('async');

module.exports = function(Post) {
  Post.observe('before save', function updateTimestamp(context, next) {
    // Add a timestamp to each log entry.
    var now = Date.now() / 1000 | 0;

    if (context.instance.id == null) {
      context.instance.created_at = context.instance.created_at ? context.instance.created_at : now;
      context.instance.updated_at = context.instance.updated_at ? context.instance.updated_at : now;
      context.instance.review_healthy_count = 0;
      context.instance.review_unhealthy_count = 0;
    } else {
      context.instance.updated_at = now;
    }

    next();
  });

  Post.remoteMethod(
    'uploadPostImage',
    {
      description: 'Saves images from the client to the cloud.',
      http: { path: '/image/upload', verb: 'post' },
      accepts: [],
      returns: { root: true }
    }
  );

  /**
   *
   * @param userId
   * @param image
   * @param callback
   */
  Post.createPostImage = function(userId, image, callback) {
    Post.create({
      user_id: userId,
      image: image
    }, function(err, result) {
      callback(err, { success: true });
    });
  };

  /**
   * Updates the rating count in the post.
   *
   * @param postId
   * @param rating
   * @param callback
   */
  Post.updateReviewCount = function(postId, rating, callback) {
    log.info('Post.updateReviewCount() - called');

    var query = {
      where: {
        id: postId
      }
    };

    Post.findOne(query, function(err, post) {
      if (post) {
        post.review_healthy_count += 1;
        post.save(function(err, results) {
          callback(err, results);
        });
      }
    });
  };

  /**
   *
   * @param userId
   * @param options
   */
  Post.getUserPosts = function(userId, options, callback) {
    log.info('Post.getUserPosts() - called');

    Post.find({ where: { user_id: userId }, limit: options.limit, order: 'created_at DESC' }, function(err, posts) {
      log.info('Post.getUserPosts() - post count:', posts.length);
      callback(err, posts);
    });
  };

  Post.remoteMethod(
    'getPostStream',
    {
      description: 'Get posts that are to be reviewed by the user.',
      http: { path: '/review-stream', verb: 'get' },
      accepts: [
        {
          arg: 'userId',
          description: 'The user ID for context.',
          type: 'string',
          required: true
        },
        {
          arg: 'limit',
          description: 'The number of posts to return',
          type: 'string',
          required: false
        }
      ],
      returns: { root: true }
    }
  );

  /**
   * Gets the items to be reviewed by a user.
   *
   * @param userId
   * @param limit
   * @param callback
   */
  Post.getPostStream = function(userId, limit, callback) {
    var getPosts = function(callback) {
      Post.find({ limit: limit, order: 'created_at DESC' }, function(err, posts) {
        callback(err, posts);
      });
    };

    var injectUser = function(posts, callback) {
      var User = app.models.Member;
      var postsMods = [];

      async.each(posts, function(post, callback) {
        // Get the user data.
        User.findOne({ where: { id: post.user_id } }, function(err, user) {
          post.user = user;
          postsMods.push(post);
          callback(err);
        });
      }, function(err) {
        callback(err, postsMods);
      });
    };

    async.waterfall([
      async.apply(getPosts),
      async.apply(injectUser)
    ], function(err, posts) {
      callback(err, posts);
    });
  };
};
