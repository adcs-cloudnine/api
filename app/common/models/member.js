var crypto = require('crypto');
var HASH_SALT = 'SDLKjfffd0d99fw9j(@(dfjss.d.fj2*D*@)Fjkdfjf';

module.exports = function(Member) {
  Member.observe('before save', function updateTimestamp(context, next) {
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

  Member.remoteMethod(
    'registerUser',
    {
      description: 'Registers a user.',
      http: { path: '/register', verb: 'get' },
      accepts: [
        {
          arg: 'name',
          description: 'The user full name.',
          type: 'string',
          required: true
        },
        {
          arg: 'email',
          description: 'The user email.',
          type: 'string',
          required: true
        },
        {
          arg: 'password',
          description: 'The user password.',
          type: 'string',
          required: true
        }
      ],

      returns: { root: true }
    }
  );

  /**
   * Register a user to the system.  If email exists in the system, a 400 error is returned.
   *
   * @param userId
   * @param image
   * @param callback
   */
  Member.registerUser = function(name, email, password, callback) {
    Member.find({ where: { email: email } }, function(err, result) {
      if (result.length === 0) {
        var passwordHash = crypto.createHash('md5').update(HASH_SALT + password).digest('hex');

        // Register the user.
        var user = {
          name: name,
          email: email,
          password: passwordHash
        };

        Member.create(user, function(err, result) {
          var response = {
            user: result
          };

          callback(err, response);
        });
      } else {
        // Error - user already exists.
        var err = new Error('User already exists in the system');
        err.statusCode = 400;

        callback(err);
      }
    });
  };

  Member.remoteMethod(
    'authenticateUser',
    {
      description: 'Authenticate a user.',
      http: { path: '/authenticate', verb: 'get' },
      accepts: [
        {
          arg: 'email',
          description: 'The user email.',
          type: 'string',
          required: true
        },
        {
          arg: 'password',
          description: 'The user password.',
          type: 'string',
          required: true
        }
      ],

      returns: { root: true }
    }
  );

  /**
   * Authenticate user with an email/password combination.
   *
   * @param email
   * @param password
   * @param callback
   */
  Member.authenticateUser = function(email, password, callback) {
    var passwordHash = crypto.createHash('md5').update(HASH_SALT + password).digest('hex');

    Member.find({ where: { email: email, password: passwordHash } }, function(err, result) {
      if (result.length > 0) {
        // Success.
        callback(err, result);
      } else {
        // Error - invalid login.
        var err = new Error('Invalid email/password combination');
        err.statusCode = 400;

        callback(err);
      }
    });
  };

  Member.remoteMethod(
    'addFollow',
    {
      description: 'Follow a user.',
      http: { path: '/users/follow/add', verb: 'get' },
      accepts: [
        {
          arg: 'userId',
          description: 'The user ID to add the follow to.',
          type: 'string',
          required: true
        },
        {
          arg: 'followingUserId',
          description: 'The user ID to be followed.',
          type: 'string',
          required: true
        }
      ],

      returns: { root: true }
    }
  );

  /**
   *
   * @param userId
   * @param followingUserId
   * @param callback
   */
  Member.addFollow = function(userId, followingUserId, callback) {
    var query = {
      user_id: userId
    };

    Member.findOrCreate(query, data, function(err, review, isCreate) {
      if (isCreate == true) {
        // Update post count.
        var Post = app.models.Post;
        Post.updateReviewCount(postId, rating, function(err, results) {
          callback(err, review);
        });
      }
    });
  };
};
