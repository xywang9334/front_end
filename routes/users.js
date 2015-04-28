var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/examplemongo';
var bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    var collection = db.collection('users');
    collection.find().toArray(function(err, items) {
      res.render('users/index', {
        users: items
      });
    });
  });
});

router.get('/new', function(req, res, next) {
  res.render('users/new');
});

router.post('/create', function(req, res, next){
	MongoClient.connect(url, function(err, db){
		var collection = db.collection('users');
		
		var salt = bcrypt.genSaltSync(10);
		var hash = bcrypt.hashSync(req.body.password, salt);
		var formObjects = req.body;
		var password = formObjects.password;
		formObjects.password = hash;
		collection.insert(req.body, function(err, result){
			if(!err)
			{
				res.cookie('userid', formObjects.email, {maxAge: 60*60*24*1000});
				res.redirect('/users/profile');
			}
			else
			{
				res.send(err);
			}
		});
	});
});

router.post('/login', function(req, res, next){
	MongoClient.connect(url, function(err, db){
		var formObjects = req.body;
		var password = formObjects.password;
		var userEmail = formObjects.email;
		var collection = db.collection('users');
		collection.findOne({email: userEmail}, function(err, result){
			if(!err)
			{
				var hash = result.password;
				if(bcrypt.compareSync(password, hash))
				{
					res.cookie("userid", userEmail, {maxAge: 60*60*24*1000});
					res.redirect("/users/profile");
				}
				else
				{
					res.send("incorrect password\n");
				}

			}
			else
			{
				res.send("account not found");
			}
		});
	});
});

router.get('/profile', function(req, res, next) {
	if (req.cookies.userid) {
		res.send('User logged in. Your email is ' + req.cookies.userid);
	} else {
		res.redirect('/users/login');
	}
});

router.get('/logout', function(req, res, next) {
	if (req.cookies.userid) {
		res.clearCookie('userid');
		res.redirect('/users/login');
	} else {
		res.redirect('/users/login');
	}
});

router.get('/login', function(req, res, next){
	res.render('users/login');
});

router.get('/savecookie', function(req, res, next){
	res.cookie('name', '1234', {maxAge: 60*60*24*1000});
	res.send("Cookie saved");

});

router.get('/checkcookie', function(req,res,next) {
	if (req.cookies.name) {
		res.send(req.cookies.name);
	} else {
		res.send("No named cookies");
	}
});

router.get('/deletecookie', function(req, res, next) {
	if (req.cookies.name) {
		res.clearCookie('name');
		res.send("Cookies cleared");
	} else {
		res.send("No cookies found");
	}
});
	

module.exports = router;
