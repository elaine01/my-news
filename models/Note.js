const mongoose = require('mongoose');

// Schema constructor reference
let Schema = mongoose.Schema;

// note schema
let NoteSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	comment: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

// This creates our model from the above schema, using mongoose's model method
const Note = mongoose.model('Note', NoteSchema);

// export Note model
module.exports = Note;