var Log = require('log');
var log = new Log('info');
var crypto = require('crypto');
var HASH_SALT = 'SDLKjfffd0d99fw9j(@(dfjss.d.fj2*D*@)Fjkdfjf';

module.exports = function(Member) {
  Member.observe('before save', function updateTimestamp(context, next) {
    // Add a timestamp to each log entry.
    if (context.instance.id == null) {
      // Instance being created.
      context.instance.created = new Date();
      context.instance.updated = new Date();
      context.instance.following = [];
      context.instance.favorites = [];
    } else {
      // Instance being updated.
      context.instance.updated = new Date();
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
    log.info('Member.registerUser() - called');

    Member.find({ where: { email: email } }, function(err, result) {
      if (result.length === 0) {
        log.info('Member.registerUser() - User email does not exist in system.  Creating user.');

        var passwordHash = crypto.createHash('md5').update(HASH_SALT + password).digest('hex');

        // Register the user.
        var user = {
          name: name,
          email: email,
          password: passwordHash
        };

        Member.create(user, function(err, result) {
          log.info('Member.registerUser() - User created:', email);

          callback(err, result);
        });
      } else {
        // Error - user already exists.
        log.error('Member.registerUser() - user already exists:', email);

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
    log.info('Member.authenticateUser() - called');

    var passwordHash = crypto.createHash('md5').update(HASH_SALT + password).digest('hex');
    Member.findOne({ email: email, password: passwordHash }, function(err, result) {
      if (result) {
        log.info('Member.authenticateUser() - authentication success');

        // Success.
        callback(err, result);
      } else {
        log.error('Member.authenticateUser() - authentication fail');

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
   * Adds an user as a follower.
   *
   * @param userId
   * @param followingUserId
   * @param callback
   */
  Member.addFollow = function(userId, followingUserId, callback) {
    log.info('Member.addFollow() - called');

    var query = {
      user_id: userId
    };

    Member.findOne(query, function(err, user) {
      if (user) {
        log.info('Member.addFollow() - User found');

        if (user.following.indexOf(followingUserId) === -1) {
          log.info('Member.addFollow() - followingUserId not found.  Adding follow');

          user.following.push(followingUserId);
          user.save(function(err, result) {
            log.info('Member.addFollow() - follower added followingUserId:', followingUserId);
            callback(err, result);
          });
        } else {
          log.info('Member.addFollow() - Follower exists, not added followingUserId:', followingUserId);
          callback(err, user);
        }
      } else {
        log.info('Member.addFollow() - User NOT found');
        callback(err, user);
      }
    });
  };
};
