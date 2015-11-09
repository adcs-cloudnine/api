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
      http: { path: '/register', verb: 'put' },
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
   *
   * @param userId
   * @param image
   * @param callback
   */
  Member.registerUser = function(name, email, password, callback) {
    Member.find({ where: { email: email } }, function(err, result) {
      if (result.length === 0) {
        var crypto = require('crypto');
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
};
