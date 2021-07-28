/*
  Author: Lloyd Dakin, Nicholas Eng
  Class: CSC337
  Description: server for the InstaGrown app, uses mongoose to store information like users, post friends statuses etc.
*/

/*    SETUP   */
//imports
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//Connect to mongoDB ostaa database
const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/InstaGrown';
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/*  SCHEMAS  */
var Schema = mongoose.Schema;

//User schema
var UserSchema = new Schema({
    Username: String,
    Passowrd: String,
    Bio: String,
    Email: String,
    Friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    Posts: [{ type: Schema.Types.ObjectID, ref: 'Post' }]
});

//Post Schema
var PostSchema = new Schema({
    //Poster: UserSchema, // maybe uncomment later?
    Title: String,
    Content: String,
    Image: String, //TODO how to implement images
    Comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    Likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

//Comment Schema
var CommentSchema = new Schema({
    //Poster: UserSchema,
    Content: String,
    Likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

//Message Schema
var MessageSchema = new Schema({
    Sender: UserSchema,
    Receiver: UserSchema,
    Content: String,
    Time: Number
});

//add schemas to database
var User = mongoose.model('User', UserSchema);
var Comment = mongoose.model('Comment', CommentSchema);
var Post = mongoose.model('Post', PostSchema);
var Message = mongoose.model('Message', MessageSchema);

/*    REQUESTS   */

//index.html requests---------------------------------------------------------------------

//takes a UserObject JSON string from client, parses, uses fields username and passowrd to login
app.post("/login/user/", (req, res) => {
    var userObj = JSON.parse(req.body.userObjStr);
    var user = userObj.username;
    var pass = userObj.password;
    //Check if user already exists if not or pass wrong return error
    User.find({ username: user }).exec(function (error, results) {
        if (results.length == 0) {
            res.end(JSON.stringify({ text: 'error' }));
        }
        else {
            //check if password matches
            if (results[0].password != pass) {
                res.end(JSON.stringify({ text: 'error' }));
            }
            else {
                //add cookie for login 10 min timer
                res.cookie("login", { username: user }, { maxAge: 900000 });
                console.log("login successful!")
                res.end(JSON.stringify({ text: 'ok' }));
            }
        }
    });
});

//accountCreation.html requests-----------------------------------------------------------

//adding a new user, takes UserObjectJSONstr and gets username and password
app.post("/add/user/", (req, res) => {
    //parse JSON object store data
    var userObj = JSON.parse(req.body.userObjStr);
    var user = userObj.username;
    var pass = userObj.password;
    var bio = userObj.bio;
    var email = userObj.email;

    //Check if user already exists
    User.find({ username: user }).exec(function (error, results) {
        //create the account
        if (results.length == 0) {
            var newUser = new User({
                username: user,
                password: pass,
                Bio: bio,
                Email: email,
                Friends: [],
                Posts: []
            });
            newUser.save(function (err) { if (err) console.log("error occured saving to db"); });
            console.log('user created!');
            res.end(JSON.stringify({ text: 'User created!' }));
        }
        //user exists, send error
        else {
            console.log('user already exists!');
            res.end(JSON.stringify({ text: 'User already exists, please choose a different username' }));
        }
    });
});

//home.html requests----------------------------------------------------------------------

//searches users with keyword, takes a JSON string of searchObj{ username: name }
app.get("/search/user/", (req, res) => {

    //parse JSON object store data
    searchObj = JSON.parse(req.body.searchObjStr);
    user = searchObj.username;

    //search database and return list of users
    User.find({ username: user }).exec(function (error, results) {
        var result = [];
        for (var i = 0; i < results.length; i++) {
            //add user to list of found users
            result.push(results[i]);
        }
        res.end(JSON.stringify(result, null, 2));
    });
});

//searches posts with keyword in content field, takes a JSON string of searchObj{ keyword: key }
app.get("/search/posts/", (req, res) => {

    //parse JSON object store data
    searchObj = JSON.parse(req.body.searchObjStr);
    key = searchObj.keyword;

    //search database and return list of posts whose content contains key
    Post.find({ Content: new RegExp(req.params.key, "i") }).exec(function (error, results) {
        var result = [];
        for (var i = 0; i < results.length; i++) {
            //add post to list of found posts
            result.push(results[i]);
        }
        res.end(JSON.stringify(result, null, 2));
    });
});

//adds a comment to a post
//app.post("/comment/post/:title/:content", (req, res) => {
app.post("/comment/post/:title", (req, res) => {
  let t = req.params.title;
  userN = req.cookies.login.username;
  let commentString = JSON.parse(req.body.Post);
  var newComment = new Post(commentString);
  Post.find({ Title: t}).exec(function (error, results) {
    db.collection("posts").update(
      { Title: t },
      { $push: { comments: newComment } } );
      res.end("");
  });
});

//returns a user's profile
app.get("/get/user/profile", (req, res) => {

});

//adds a user as a friend
app.get("/add/user/friend", (req, res) => {

});

//adds a like to a post
app.post("/like/post", (req, res) => {

});

//adds a like to a comment
app.post("/like/comment", (req, res) => {

});

//shares another user's post as a new post from the current user
app.post("/share/post", (req, res) => {

});

//creates a new post from the user
app.post("/get/posts", (req, res) => {
  userN = req.cookies.login.username;
  // searches for username
  Users.find({Username:userN}).exec(function(error, results) {
    if (results.length == 1) {
      postsList = results[0].Posts;
      res.end(JSON.stringify(postsList,null,4));
    // if no username matches, send no such username
    } else {
      res.end("BAD");
    }
  });
});

app.get("/create/post", (req, res) => {
  userN = req.cookies.login.username;
  Users.find({Username:userN}).exec(function(error, results) {
    if (results.length == 1) {
      // creates and saves post
      let postString = JSON.parse(req.body.Post);
      var newPost = new Post(postString);
      newPost.save(function (err) { if (err) console.log("ERROR");});

      // updates user's array of posts
      db.collection("users").update(//collection name?
        { Username: userN },
        { $push: { Posts: newPost } }
      );
      res.end("GOOD");
    // if no username matches, send no such username
    } else {
      res.end("No such username");
    }
  });
});


//updates the users bio
app.post("/update/bio", (req, res) => {

});

//chats.html requests---------------------------------------------------------------------

//sends a specified user a message
app.post("/send/user/message", (reg, res) => {

});

/*    FUNCTIONS   */
function authorize(req, res, next) {
    //update to a more secure salting and hashing method with session keys
    if (req.cookies.login.username != undefined)
        next();
    else
        res.end('unauthorized');
}

/*    RUNTIME    */

//pages to serve depending on path
app.use('/accountCreation.html', authorize);
app.use('/chats.html', authorize);
app.use('/home.html', authorize);
app.use('/', express.static("public_html"));