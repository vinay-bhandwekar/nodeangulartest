var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var story_schema = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', story_schema);