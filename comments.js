//Create web server
const express = require('express');
const app = express();
//Create a server
const server = require('http').createServer(app);
//Create a socket
const io = require('socket.io')(server);
//Connect to the database
const mongoose = require('mongoose');
//Create a model
const Comment = require('./models/Comment');
//Connect to the database
mongoose.connect('mongodb://localhost:27017/comments', { useNewUrlParser: true, useUnifiedTopology: true });
//Listen for incoming connections
server.listen(3000);
//Set the directory for static files
app.use(express.static(__dirname + '/public'));
//Listen for incoming connections
io.on('connection', function(socket) {
    //Get comments from database
    Comment.find().sort({ date: -1 }).limit(10).exec(function(err, comments) {
        if (!err) {
            socket.emit('load comments', comments);
        }
    });
    //Add comments
    socket.on('add comment', function(data) {
        let comment = new Comment({
            name: data.name,
            comment: data.comment,
            date: new Date()
        });
        comment.save(function(err) {
            if (!err) {
                io.emit('add comment', comment);
            }
        });
    });
});
// Path: models/Comment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const commentSchema = new Schema({
    name: String,
    comment: String,
    date: Date
});
module.exports = mongoose.model('Comment', commentSchema);
