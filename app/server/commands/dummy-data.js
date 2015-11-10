var path = require('path');
var app = require(path.resolve(__dirname, '../../'));
var async = require('async');
var Log = require('log');
var log = new Log('info');
var User = app.models.Member;
var Review = app.models.Review;
var _ = require('underscore');
var crypto = require('crypto');
var HASH_SALT = 'SDLKjfffd0d99fw9j(@(dfjss.d.fj2*D*@)Fjkdfjf';

function DummyData() {
  var that = {};
  that.usersCreated = {};

  that.main = function() {
    async.series([
      async.apply(that.deleteUsers),
      async.apply(that.createUsers),
      async.apply(that.addFollows),
      async.apply(that.deletePosts),
      async.apply(that.createPosts)
    ], function(err, results) {
      log.info('done');
      process.exit(0);
    });
  };

  that.deleteUsers = function(callback) {
    User.destroyAll(function(err, results) {
      log.info('Deleting all users');
      callback(err, results);
    });
  };

  that.createUsers = function(callback) {
    var users = [];
    that.usersCreated = {};

    var user = new User();
    user.name = 'Michael Pollan';
    user.email = 'mp';
    user.password = 'mp';
    user.rating = 'healthy';
    user.picture = {
      large: 'https://s3.amazonaws.com/openeatsproject/users/michael-pollan.jpg',
      medium: 'https://s3.amazonaws.com/openeatsproject/users/michael-pollan.jpg',
      small: 'https://s3.amazonaws.com/openeatsproject/users/michael-pollan.jpg'
    };
    users.push(user);

    user = new User();
    user.name = 'Guy Fiery';
    user.email = 'gf';
    user.password = 'gf';
    user.rating = 'unhealthy';
    user.picture = {
      large: 'https://s3.amazonaws.com/openeatsproject/users/guy-fiery.jpg',
      medium: 'https://s3.amazonaws.com/openeatsproject/users/guy-fiery.jpg',
      small: 'https://s3.amazonaws.com/openeatsproject/users/guy-fiery.jpg'
    };
    users.push(user);

    user = new User();
    user.name = 'Anthony Bourdain';
    user.email = 'ab';
    user.password = 'ab';
    user.rating = 'healthy';
    user.picture = {
      large: 'https://s3.amazonaws.com/openeatsproject/users/anthony-bourdain.jpg',
      medium: 'https://s3.amazonaws.com/openeatsproject/users/anthony-bourdain.jpg',
      small: 'https://s3.amazonaws.com/openeatsproject/users/anthony-bourdain.jpg'
    };
    users.push(user);

    user = new User();
    user.name = 'Joe Cross';
    user.email = 'jc';
    user.password = 'jc';
    user.rating = 'healthy';
    user.picture = {
      large: 'https://s3.amazonaws.com/openeatsproject/users/joe-cross.jpg',
      medium: 'https://s3.amazonaws.com/openeatsproject/users/joe-cross.jpg',
      small: 'https://s3.amazonaws.com/openeatsproject/users/joe-cross.jpg'
    };
    users.push(user);

    user = new User();
    user.name = 'Sai Majeti';
    user.email = 'sm';
    user.password = 'sm';
    user.rating = 'healthy';
    user.picture = {
      large: 'https://s3.amazonaws.com/openeatsproject/users/sai-majeti.jpg',
      medium: 'https://s3.amazonaws.com/openeatsproject/users/sai-majeti.jpg',
      small: 'https://s3.amazonaws.com/openeatsproject/users/sai-majeti.jpg'
    };
    users.push(user);

    user = new User();
    user.name = 'Sukriti Thapa';
    user.email = 'st';
    user.password = 'st';
    user.rating = 'healthy';
    user.picture = {
      large: 'https://s3.amazonaws.com/openeatsproject/users/sukriti-thapa.jpg',
      medium: 'https://s3.amazonaws.com/openeatsproject/users/sukriti-thapa.jpg',
      small: 'https://s3.amazonaws.com/openeatsproject/users/sukriti-thapa.jpg'
    };
    users.push(user);

    user = new User();
    user.name = 'Caleb Whang';
    user.email = 'cw';
    user.password = 'cw';
    user.rating = 'unhealthy';
    user.picture = {
      large: 'https://s3.amazonaws.com/openeatsproject/users/caleb-whang.jpg',
      medium: 'https://s3.amazonaws.com/openeatsproject/users/caleb-whang.jpg',
      small: 'https://s3.amazonaws.com/openeatsproject/users/caleb-whang.jpg'
    };
    users.push(user);

    user = new User();
    user.name = 'Gaurang Dave';
    user.email = 'gd';
    user.password = 'gd';
    user.rating = 'healthy';
    user.picture = {
      large: 'https://s3.amazonaws.com/openeatsproject/users/gaurang-dave.jpg',
      medium: 'https://s3.amazonaws.com/openeatsproject/users/gaurang-dave.jpg',
      small: 'https://s3.amazonaws.com/openeatsproject/users/gaurang-dave.jpg'
    };
    users.push(user);

    user = new User();
    user.name = 'Nick Ostrowski';
    user.email = 'no';
    user.password = 'no';
    user.rating = 'healthy';
    user.picture = {
      large: 'https://s3.amazonaws.com/openeatsproject/users/nick-ostrowski.jpg',
      medium: 'https://s3.amazonaws.com/openeatsproject/users/nick-ostrowski.jpg',
      small: 'https://s3.amazonaws.com/openeatsproject/users/nick-ostrowski.jpg'
    };
    users.push(user);

    async.each(users, function(user, callback) {
      //User.registerUser(user.name, user.email, user.password, function(err, user) {
      //  log.info('Created user:', user.name);
      //  that.usersCreated[user.email] = user;
      //  callback(err, user);
      //});
      var passwordHash = crypto.createHash('md5').update(HASH_SALT + user.password).digest('hex');

      // Register the user.
      var data = {
        name: user.name,
        email: user.email,
        password: passwordHash,
        rating: user.rating
      };

      console.log(data);

      User.create(data, function(err, user) {
        log.info('Created user:', user.name);
        that.usersCreated[user.email] = user;
        callback(err, user);
      });
    }, function(err, results) {
      callback(err, results);
    });
  };

  that.addFollows = function(callback) {
    log.info('addFollows() - called');

    async.each([
      that.usersCreated['cw'],
      that.usersCreated['gd'],
      that.usersCreated['st'],
      that.usersCreated['sm'],
      that.usersCreated['no']
    ], function(user, callback) {
      log.info('addFollows() - adding follows');

      user.following = [
        that.usersCreated['ab'].id,
        that.usersCreated['gf'].id,
        that.usersCreated['sm'].id,
        that.usersCreated['st'].id,
        that.usersCreated['no'].id,
        that.usersCreated['gd'].id,
        that.usersCreated['cw'].id
      ];
      user.save(function(err, results) {
        callback(err);
      });
    }, function(err, results) {
      callback(err);
    });
  };

  that.deletePosts = function(callback) {
    var Post = app.models.Post;

    Post.destroyAll(function(err, results) {
      log.info('Deleting all posts');
      callback(err, results);
    });
  };

  that.createPosts = function(callback) {
    that.generatePosts(that.usersCreated['mp'].id, 75, 25);
    that.generatePosts(that.usersCreated['cw'].id, 60, 40);
    that.generatePosts(that.usersCreated['jc'].id, 90, 10);
    that.generatePosts(that.usersCreated['gf'].id, 10, 90);
    that.generatePosts(that.usersCreated['no'].id, 90, 10);
    that.generatePosts(that.usersCreated['sm'].id, 70, 30);
    that.generatePosts(that.usersCreated['gd'].id, 70, 30);
    that.generatePosts(that.usersCreated['st'].id, 80, 20);
    that.generatePosts(that.usersCreated['ab'].id, 85, 15);
    callback();
  };

  that.generatePosts = function(userId, healthyCount, unhealthyCount) {
    log.info('generatePosts() - called for:', userId);
    var images = {
      healthy: [
        'https://s3.amazonaws.com/openeatsproject/posts/healthy-1.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/healthy-2.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/healthy-3.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/healthy-4.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/healthy-5.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/healthy-6.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/healthy-7.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/healthy-8.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/healthy-9.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/healthy-10.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/healthy-11.jpg'
      ],
      unhealthy: [
        'https://s3.amazonaws.com/openeatsproject/posts/unhealthy-1.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/unhealthy-2.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/unhealthy-3.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/unhealthy-4.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/unhealthy-5.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/unhealthy-6.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/unhealthy-7.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/unhealthy-8.jpg',
        'https://s3.amazonaws.com/openeatsproject/posts/unhealthy-9.jpg'
      ]
    };

    var Post = app.models.Post;
    var posts = [];
    var postCreate;

    // Generate healthy.
    for (var i = 0; i < healthyCount; i++) {
      postCreate = new Post();
      postCreate.user_id = userId;

      var image = images['healthy'][Math.floor(Math.random()*images['healthy'].length)];
      postCreate.images = {
        small: image,
        medium: image,
        large: image
      };
      postCreate.rating = 'healthy';
      posts.push(postCreate);
    }

    // Generate unhealthy.
    for (var i = 0; i < unhealthyCount; i++) {
      postCreate = new Post();
      postCreate.user_id = userId;

      var image = images['unhealthy'][Math.floor(Math.random()*images['unhealthy'].length)];
      postCreate.images = {
        small: image,
        medium: image,
        large: image
      };
      postCreate.rating = 'unhealthy';
      posts.push(postCreate);
    }

    posts = _.shuffle(posts);

    async.each(posts, function(post, callback) {
      Post.create(post, function(err, result) {
        callback(err, result);
      });
    }, function(err, results) {
      console.log(err);
    });
  };

  return that;
}

var dd = new DummyData();
dd.main();
