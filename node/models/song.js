const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
    songId  : Number,
    name    : String,
    lyrics  : String,
    updated_at  : Date,
});

songSchema.pre('save', function(next) {
    var currentDate = new Date();

    this.updated_at = currentDate;
    next();
});

var Song = mongoose.model('Song', songSchema);

module.exports = Song;