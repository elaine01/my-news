const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const axios = require('axios');
const cheerio = require('cheerio');

// Require all models
const db = require('./models');

const PORT = 3000;

// Initialize Express
const app = express();

// { Middleware }
app.use(logger('dev')); // logging requests
app.use(bodyParser.urlencoded({ extended: false })); // Handling form submissions
app.use(bodyParser.json());
app.use(express.static('public')); // Serve the public folder as a static directory

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mynews_db", {
  //useMongoClient: true
});

// { Routes }

// Scrape new articles and save to database
app.get('/scrape', function(req, res) {
	axios.get('https://news.crunchbase.com/news/').then(function(response) {
		const $ = cheerio.load(response.data);

		$('.ebr-title').each(function(i, element) {

			// save empty result object to store articles
			const result = {};

			result.title = $(this)
				.find('h2')
				.text();
			result.link = $(this)
				.children('a')
				.attr('href')
			result.summary = $(this)
				.children('p')
				.text();
			// result.date = $(this)		
			// result.image = $(this)
			// create new article using result object
			db.Article
				.create(result)
				.then(function(dbArticles) {
					res.send('Scrape complete');
				})
				.catch(function(err) {
					res.json(err);
				});
		});
		res.redirect('/');
	});
});

// Redirect index
// app.get('/', function(req, res) {
// 	res.redirect('/articles')
// });

// Get all articles from database (and comments)
app.get('/', function(req, res) {
	db.Article
		.find({ saved: false })
		//.populate('notes')
		.then(function(dbArticles) {
			//res.json(dbArticles);
			res.render('index', {article: dbArticles})
		})
		.catch(function(err) {
			res.json(err);
		});
});

// Get all saved articles
app.get('/saved', function(req, res) {
	db.Article
		.find({ saved: true })
		//.populate('notes')
		.then(function(dbArticles) {
			//res.json(dbArticles);
			res.render('saved', {saved: dbArticles})
		})
		.catch(function(err) {
			res.json(err);
		});
});

// Save article
app.post('/saved/:id', function(req, res) {
	db.Article
		.update( {_id: req.params.id}, {$set: {saved: true}})
		//.populate('notes')
		.then(function(dbArticle) {
			res.json(dbArticle);
		})
		.catch(function(err) {
			res.json(err);
		});
		res.redirect('/');
});

// Get comments from an article in the database
app.get('/articles/:id', function(req, res) {
	db.Article
		.findOne( {_id: req.params.id})
		.populate('notes')
		.then(function(dbArticle) {
			console.log("dbArticle ", dbArticle);
			res.json(dbArticle);
		})
		.catch(function(err) {
			res.json(err);
		});
});

// Delete article from saved
app.post('/delete/article/:id', function(req, res) {
	db.Article
		.update( {_id: req.params.id}, {$set: {saved: false}} )
		//.populate('notes')
		.then(function(dbArticle) {
			res.json(dbArticle);
		})
		.catch(function(err) {
			res.json(err);
		});
		res.redirect('/saved')
});

// Create comment on an article
app.post('/article/comment/:id', function(req, res) {
	console.log("req.body ", req.body);
	db.Note
		.create(req.body)
		.then(function(dbNote) {
			console.log("dbNote" , dbNote);
			console.log("req.params.id ", req.params.id);
			return db.Article.findOneAndUpdate({_id: req.params.id}, { $push: {notes: dbNote._id}}, { new: true });
		})
		.then(function(dbArticle) {
			console.log("hello i'm within create post");
			res.json(dbArticle);
		})
		.catch(function(err) {
			res.json(err);
		});
		// res.redirect('/saved')
});

// Delete comment from article
app.post('/delete/comment/:id', function(req, res) {
	db.Note
		.remove( {_id: req.params.id} )
		.then(function(dbNote) {
			res.json(dbNote);
		})
		.catch(function(err) {
			res.json(err);
		});
		res.redirect('/saved')
});

// Start server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});