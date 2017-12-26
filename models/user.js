const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email       : String,
    token       : String,
    data        : {
        games   : Number,
        won     : Number,
    },
    updated_at  : Date,
});

userSchema.pre('save', function(next) {
    var currentDate = new Date();

    this.updated_at = currentDate;
    next();
});

userSchema.methods.completeGame = function() {
    this.data.games += 1;
};
userSchema.methods.winGame = function() {
    this.data.won += 1;
};
userSchema.methods.getWinRate = function() {
    return this.data.games > 0 ? this.data.won/this.data.games : 0;
};
userSchema.methods.resetGames = function() {
    this.data.won = 0;
    this.data.games = 0;
};
userSchema.methods.updateToken = function(token) {
    this.token = token;
}

var User = mongoose.model('User', userSchema);

module.exports = User;