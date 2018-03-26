const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const request = require("request");

const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require('./models');

let PORT = 3000;

// Initialize Express
const app = express();

// { Middleware }

// logging requests
app.use(logger("dev"));
// Handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Serve the public folder as a static directory
app.use(express.static("public"));


// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mynews_db", {
  useMongoClient: true
});

// { Routes }

// Scrape new articles and save to database
app.get('/scrape', function(req, res) {
	axios.get('https://hackernoon.com').then(function(res) {
		var $ = cheerio.load(res.data);

		$('.u-textScreenReader').each(function(i, element) {

			// save empty result object to store articles
			const result = {};

			result.title = $(this)
				.text();
			result.link = $(this)
				.parent('a')
				.attr('href')

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
	});
});

// Get all articles from database (and comments)
app.get('/articles/:id', function(req, res) {
	db.Article
		.findOne( {_id: req.params.id})
		.populate('notes')
		.then(function(dbArticle) {
			res.json(dbArticle);
		})
		.catch(function(err) {
			res.json(err);
		});
});

// Create commend on an article
app.post('/articles/:id', function(req, res) {
	db.Note
		.create(req.body)
		.then(function(dbNote) {
			return db.Article.findOneAndUpdate({_id: req.params.id}, { $push: {note: dbNote._id}}, { new: true });
		})
		.then(function(dbArticle) {
			res.json(dbArticle);
		})
		.catch(function(err) {
			res.json(err);
		});
});

// Delete comment from article
app.post('delete/:id', function(req, res) {
	db.Note
		.remove( {_id: req.params.id} )
		.then(function(dbNote) {
			res.json(dbNote);
		})
		.catch(function(err) {
			res.json(err);
		});
});


// Start server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});