'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  originalUrl: String,
  shorterUrl: String
}, {
  timestamps: true
});

const ModelClass = mongoose.model('shortUrl', urlSchema);

var cors = require('cors');

var app = express();
app.use(bodyParser());

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
const db = process.env.MONGOLAB_URI || 'mongodb://localhost';
mongoose.connect(db);
console.log(db)
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({
    greeting: 'hello API'
  });
});

app.post("/api/shorturl/new", (request, response) => {
  const {
    url
  } = request.body;

  const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gi;

  if (urlRegex.test(url)) {
    const short = Math.floor(Math.random() * 100000).toString();

    const data = new ModelClass({
      originalUrl: url,
      shorterUrl: short
    });

    console.log(data)
    data.save((error) => {
      console.log(error)
      if (error) {
        response.send('Error Saving the Short Url');
      }
    });

    response.json({
      "original_url": url,
      "short_url": short
    })
  } else {
    response.send('Invalid URL');
  }
});

app.get("/api/shorturl/:shortUrl", (request, response, next) => {
  const short = request.params.shortUrl;

  ModelClass.findOne({
    shorterUrl: short
  }, (error, data) => {
    if (error) {
      response.send('Error finding short url.');
    }

    response.redirect(301, data.originalUrl);
  });
});

app.listen(3000, function () {
  console.log('Node.js listening ...');
});