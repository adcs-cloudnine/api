var path = require('path');
var app = require(path.resolve(__dirname, '../../'));
var Log = require('log');
var log = new Log('info');
var crypto = require('crypto');
var async = require('async');
var HASH_SALT = 'SDLKjfffd0d99fw9j(@(dfjss.d.fj2*D*@)Fjkdfjf';

module.exports = function(Member) {
  Member.observe('before save', function updateTimestamp(context, next) {
    var now = Date.now() / 1000 | 0;

    // Add a timestamp to each log entry.
    if (context.instance.id == null) {
      // Instance being created.
      context.instance.joined_on = now;
      context.instance.updated_on = now;
      context.instance.following = [];
      context.instance.favorites = [];
      context.instance.posts = [];
    } else {
      // Instance being updated.
      context.instance.updated = now;
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
    Member.findOne({ where: { email: email, password: passwordHash } }, function(err, result) {
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
      http: { path: '/follow/add', verb: 'get' },
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
      where: {
        id: userId
      }
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

  Member.remoteMethod(
    'removeFollow',
    {
      description: 'Remove a user that is followed.',
      http: { path: '/follow/remove', verb: 'get' },
      accepts: [
        {
          arg: 'userId',
          description: 'The user ID to remove the follow from.',
          type: 'string',
          required: true
        },
        {
          arg: 'followingUserId',
          description: 'The user ID to be removed.',
          type: 'string',
          required: true
        }
      ],

      returns: { root: true }
    }
  );

  /**
   * Removes a user as a follower.
   *
   * @param userId
   * @param followingUserId
   * @param callback
   */
  Member.removeFollow = function(userId, followingUserId, callback) {
    log.info('Member.removeFollow() - called');

    var query = {
      user_id: userId
    };

    Member.findOne(query, function(err, user) {
      if (user) {
        log.info('Member.removeFollow() - User found');

        var following = user.following;
        var index = following.indexOf(followingUserId);
        if (index > -1) {
          following.splice(index, 1);
        }

        user.following = following;
        user.save(function(err, user) {
          log.info('Member.removeFollow() - removed follow followingUserId:', followingUserId);
          callback(err, user);
        });

      } else {
        log.info('Member.removeFollow() - User NOT found');
        callback(err, user);
      }
    });
  };

  Member.remoteMethod(
    'getUserFollowingPosts',
    {
      description: 'Get follows and recent posts.',
      http: { path: '/following/posts', verb: 'get' },
      accepts: [
        {
          arg: 'userId',
          description: 'The user ID to get.',
          type: 'string',
          required: true
        },
        {
          arg: 'userLimit',
          description: 'The number of users to return',
          type: 'string',
          required: false
        },
        {
          arg: 'postLimit',
          description: 'The number of posts per user to return',
          type: 'string',
          required: false
        }
      ],

      returns: { root: true }
    }
  );

  /**
   * Get the posts of the users that are followed.
   *
   * @param userId
   * @param callback
   */
  Member.getUserFollowingPosts = function(userId, userLimit, postLimit, callback) {
    log.info('Member.getUserFollowingPosts() - called');
    var Post = app.models.Post;
    var userList = [];
    postLimit = postLimit ? postLimit : 5;
    userLimit = userLimit ? userLimit : 50;

    // Get the user.
    Member.findOne({ where: { id: userId } }, function(err, user) {
      var query = {
        where: {
          or: []
        },
        limit: userLimit
      };

      // Build query.
      if (user.following.length > 0) {
        user.following.forEach(function(follow) {
          query.where.or.push({ id: follow });
        });
      }

      Member.find(query, function(err, users) {
        // Load posts for each user.
        async.each(users, function(user, callback) {
          user.posts = [];

          Post.getUserPosts(user.id, { limit: postLimit }, function(err, posts) {
            if (posts) {
              user.posts = posts;
            }
            userList.push(user);

            callback(err);
          });
        }, function(err, result) {
          callback(err, userList);
        });
      });
    });
  };

  Member.remoteMethod(
    'getUserPosts',
    {
      description: 'Get follows and recent posts.',
      http: { path: '/posts', verb: 'get' },
      accepts: [
        {
          arg: 'userId',
          description: 'The user ID to get.',
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
   * Get the posts of a user.
   *
   * @param userId
   * @param limit
   * @param callback
   */
  Member.getUserPosts = function(userId, limit, callback) {
    log.info('Member.getUserPosts() - called');
    limit = limit ? limit : 25;

    Member.findOne({ where: { id: userId } }, function(err, user) {
      var Post = app.models.Post;
      var Review = app.models.Review;
      var Member = app.models.Member;

      var getPosts = function(callback) {
        Post.getUserPosts(user.id, { limit: limit }, function(err, posts) {
          callback(err, posts);
        });
      };

      var getPostCount = function(callback) {
        Post.count({ user_id: user.id }, function(err, count) {
          callback(err, count);
        });
      };

      var getReviewCount = function(callback) {
        Review.count({ user_id: user.id }, function(err, count) {
          callback(err, count);
        });
      };

      var getFollowingCount = function(callback) {
        callback(null, user.following.length);
      };

      var getFollowersCount = function(callback) {
        Member.count({ following: { in: [user.id] } }, function(err, count) {
          callback(err, count);
        });
      };

      async.parallel({
        posts: async.apply(getPosts),
        postCount: async.apply(getPostCount),
        reviewCount: async.apply(getReviewCount),
        followingCount: async.apply(getFollowingCount),
        followersCount: async.apply(getFollowersCount)
      }, function(err, results) {
        user.post_count = results.postCount;
        user.review_count = results.reviewCount;
        user.following_count = results.followingCount;
        user.followers_count = results.followersCount;
        user.posts = results.posts;

        callback(err, user);
      });
    });
  };

  Member.remoteMethod(
    'searchUsers',
    {
      description: 'Search for a user by name.',
      http: { path: '/search', verb: 'get' },
      accepts: [
        {
          arg: 'q',
          description: 'The search query.',
          type: 'string',
          required: true
        }
      ],

      returns: { root: true }
    }
  );

  /**
   * Search for a user.
   *
   * @param q
   * @param callback
   */
  Member.searchUsers = function(q, callback) {
    log.info('Member.searchUsers() - called');

    Member.getDataSource().connector.connect(function(err, db) {
      db.collection('Member', function(err, collection) {
        collection.find({ '$text': { '$search': q } }).toArray(function(err, results) {
          var users = [];

          results.forEach(function(user) {
            user.id = user._id;
            delete user._id;
            users.push(user);
          });

          callback(err, users);
        });
      });
    });
  };
};
