const mongoose = require('mongoose');

// Schema constructor reference
let Schema = mongoose.Schema;

// article schema
let ArticleSchema = new Schema({

	title: {
		type: String,
		unique: true,
		required: true
	},
	link: {
		type: String,
		unique: true,
		required: true
	},
	summary: {
		type: String
	},
	article: {
		type: Boolean,
		required: true,
		default: true
	},
	saved: {
		type: Boolean,
		required: true,
		default: false
	},
	// date: {
	// 	type:
	// },
	// image: {
	// 	type: 
	// },
	notes: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Note'
		}
	]
});

// This creates our model from the above schema, using mongoose's model method
const Article = mongoose.model('Article', ArticleSchema);

// Export article model
module.exports = Article;