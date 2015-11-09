module.exports = function(Post) {
  Post.observe('before save', function updateTimestamp(context, next) {
    // Add a timestamp to each log entry.
    var now = Date.now() / 1000 | 0;

    if (context.instance) {
      context.instance.joined_at = now;
      context.instance.updated_at = now;
    } else {
      context.data.updated_at = now;
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
};
