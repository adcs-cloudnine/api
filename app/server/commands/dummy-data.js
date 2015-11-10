var path = require('path');
var app = require(path.resolve(__dirname, '../../'));
var async = require('async');
var Log = require('log');
var log = new Log('info');
var User = app.models.Member;

function DummyData() {
  var that = {};

  that.main = function() {
    async.series([
      async.apply(that.deleteUsers),
      async.apply(that.createUsers),
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

    var user = new User();
    user.name = 'Michael Pollan';
    user.email = 'mp';
    user.password = 'mp';
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
    user.picture = {
      large: 'https://s3.amazonaws.com/openeatsproject/users/guy-fiery.jpg',
      medium: 'https://s3.amazonaws.com/openeatsproject/users/guy-fiery.jpg',
      small: 'https://s3.amazonaws.com/openeatsproject/users/guy-fiery.jpg'
    };
    users.push(user);

    user = new User();
    user.name = 'Anthony Bourdain';
    user.email = 'anthony.bourdain@gmail.com';
    user.password = '1234';
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
    user.picture = {
      large: 'https://s3.amazonaws.com/openeatsproject/users/nick-ostrowski.jpg',
      medium: 'https://s3.amazonaws.com/openeatsproject/users/nick-ostrowski.jpg',
      small: 'https://s3.amazonaws.com/openeatsproject/users/nick-ostrowski.jpg'
    };
    users.push(user);


    async.each(users, function(user, callback) {
      User.registerUser(user.name, user.email, user.password, function(err, user) {
        log.info('Created user:', user.name);
        callback(err, user);
      });
    }, function(err, results) {
      callback(err, results);
    });
  };

  return that;
}

var dd = new DummyData();
dd.main();
