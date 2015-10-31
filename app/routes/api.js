var User = require('../models/user');
var Story = require('../models/story');

var config = require('../../config');

var secret_key = config.secret_key;

var jsonwebtoken = require('jsonwebtoken');

function create_token(user){
    var token = jsonwebtoken.sign({
        id: user._id,
        name: user.name,
        username: user.username
    }, secret_key, {
        expiresInMinute: 1440
    });
    
    return token;
}

module.exports = function(app, express, io){
    var api = express.Router();
    
    api.get('/all_stories', function(req, res){
       Story.find({}, function(err, stories){
           if(err){
               res.send(err);
               return;
           }
           
           res.json(stories);
       });
    });
    
    api.post('/signup', function(req, res){        
        var user = new User({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password
        });
        
        var token = create_token(user);
        
        user.save(function(err){
            if(err){
                res.send(err);
                return;
            }
            
            res.json({
                success: true,
                message: 'User has been created!',
                token: token
            });
        });
    });
    
    api.get('/users', function(req, res){
        User.find({}, function(err, users){
            if(err){
                res.send(err);
                return;
            }
            
            res.json(users);
        });
    });
    
    api.post('/login', function(req, res){
        User.findOne({ 
            username: req.body.username 
        }).select('name username password').exec(function(err, user){
            if(err){
                throw err;
            }
            
            if(!user){
                res.send({ message: "User does not exist!" });
            } else if(user){
                var valid_password = user.compare_password(req.body.password);
                
                if(!valid_password){
                    res.send({ message: "Password is invalid!" });
                } else {
                    // Token Based Authorization used here
                    // token creation
                    var token = create_token(user);
                    
                    res.json({
                        success: true,
                        message: "User logged in successfully!",
                        token: token
                    });
                }
            }
        });
    });
    
    // Check if logged in on other pages
    api.use(function(req, res, next){
        console.log("Somebody just came to our app!");
        
        var token = req.body.token || req.param('token') || req.headers['x-access-token'];
        
        // check if token exists
        if(token){
            jsonwebtoken.verify(token, secret_key, function(err, decoded){
                if(err){
                    res.status(403).send({ success: false, message: "Failed to authenticate user!" });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.status(403).send({ success: false, message: "No token provided!" });
        }
    });
    
    // Token checked pages
    api.route('/')
    
        .post(function(req, res){
            var story = new Story({
                creator: req.decoded.id,
                content: req.body.content
            });
        
            story.save(function(err, newStory){
                if(err){
                    res.send(err);
                    return;
                }
                
                io.emit('story', newStory);
                
                res.json({ message: "New story created!" });
            });
        })
    
        .get(function(req, res){
            Story.find({ creator: req.decoded.id },function(err, stories){
                if(err){
                   res.send(err);
                   return;
                }
                
                res.json(stories);
            });
        });
    
    // Logged in user data
    api.get('/me',function(req, res){
        res.json(req.decoded);
    });
    
    return api;
}