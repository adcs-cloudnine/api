var path = require('path');
var app = require(path.resolve(__dirname, '../../'));

var REVIEW_RATINGS = [
  'healthy',
  'unhealthy',
  'unsure'
];

module.exports = function(Review) {
  Review.remoteMethod(
    'addRating',
    {
      description: 'Add a review rating for a post.',
      http: { path: '/add', verb: 'post' },
      accepts: [
        {
          arg: 'rating',
          description: 'The health rating of the food (healthy, unhealthy)',
          type: 'string',
          required: true
        },
        {
          arg: 'postId',
          description: 'The post ID being reviewed',
          type: 'string',
          required: true
        },
        {
          arg: 'userId',
          description: 'The user ID of the reviewer',
          type: 'string',
          required: true
        }
      ],

      returns: { root: true }
    }
  );

  /**
   * Add a review rating to a post.
   *
   * @param rating
   * @param postId
   * @param userId
   * @param callback
   */
  Review.addRating = function(rating, postId, userId, callback) {
    if (REVIEW_RATINGS.indexOf(rating) == -1) {
      // Error - invalid rating.
      var err = new Error('Invalid rating.  Must be one of ' + REVIEW_RATINGS.join(', '));
      err.statusCode = 400;
      callback(err);
    } else {
      var query = {
        where: {
          post_id: postId,
          user_id: userId
        }
      };
      console.log(query);

      var data = {
        rating: rating,
        post_id: postId,
        user_id: userId
      };

      Review.findOrCreate(query, data, function(err, review, isCreate) {
        if (isCreate == true) {
          // Update post count.
          var Post = app.models.Post;
          Post.updateReviewCount(postId, rating, function(err, results) {
            callback(err, review);
          });
        }
      });
    }
  };
};
