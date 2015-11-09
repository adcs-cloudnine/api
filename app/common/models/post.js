module.exports = function(Post) {
  Post.observe('before save', function updateTimestamp(context, next) {
    // Add a timestamp to each log entry.
    if (context.instance) {
      context.instance.created = new Date();
      context.instance.updated = new Date();
    } else {
      context.data.created = new Date();
      context.data.updated = new Date();
    }
    next();
  });

  Post.remoteMethod(
    'createPostImage',
    {
      description: 'Saves images from the client to the cloud.',
      http: { path: '/image/create', verb: 'post' },
      accepts: [
        //{
        //  arg: 'postId',
        //  type: 'string',
        //  required: true
        //},
        {
          arg: 'image',
          type: 'buffer',
          required: true
        }
      ],
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
