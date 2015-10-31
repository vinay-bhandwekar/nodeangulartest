var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var user_schema = new Schema({
    name: String,
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true, select: false }
});

user_schema.pre('save',function(next){
    var user = this;
    
    if(!user.isModified('password')) return next();
    
    bcrypt.hash(user.password, null, null, function(err,hash){
        if(err) return next(err);
        
        user.password = hash;
        next();
    });
});

user_schema.methods.compare_password = function(password){
    var user = this;
    
    return bcrypt.compareSync(password, user.password);
}

module.exports = mongoose.model('User', user_schema);