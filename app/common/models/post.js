module.exports = function(Post) {
  Post.observe('before save', function updateTimestamp(context, next) {
    // Add a timestamp to each log entry.
    var now = Date.now() / 1000 | 0;

    if (context.instance.id == null) {
      context.instance.created_at = now;
      context.instance.updated_at = now;
      context.instance.review_healthy_count = 0;
      context.instance.review_unhealthy_count = 0;
    } else {
      console.log(context.instance);
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
};
