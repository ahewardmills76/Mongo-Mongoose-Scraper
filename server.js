//Dependencies
var express = require("express");
var mongoose = require("mongoose");
var mongojs = require('mongojs');
var bodyParser = require("body-parser");
var logger = require("morgan");
var path = require("path");

// Requiring Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Our scraping tools
var request = require('request');
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

//Initialize express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";


// Connect to the Mongo DB

mongoose.connect(MONGODB_URI);

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});


// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");


//Routes


//GET Routes to render Handlebars
app.get('/', function(req, res) {
   res.render('index',{ test : "this is a test" });
   
});



// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });


app.get('/scrape', function(req, res){
    scrape(function(data){
        console.log(data, "---- this is the data");
        res.render('index', data);
    });
});

function scrape(cb) {
    // Making a request for the nytimes. The page's HTML is passed as the callback's third argument
request("https://www.nytimes.com/", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);
  
    // An empty object to save the data that we'll scrape
    var results = [];
  
    // With cheerio, find each p-tag with the "title" class
    // (i: iterator. element: the current element)
    $("article").each(function(i, element) {
  
      // Save the text of the element in a "title" variable
      var title = $(element).children().text();
  
      // In the currently selected element, look at its child elements (i.e., its a-tags),
      // then save the values for any "href" attributes that the child elements may have
      var link = $(element).children("").attr("href");
  
      var summary =$(element).children(".summary").text();
      
      // Save these results in an object that we'll push into the results array we defined earlier
      results.push({
        title: title,
        summary: summary,
        link: link
      });
    });
    cb(results);
    console.log(results);
    // Log the results once you've looped through each of the elements found with cheerio
  
  });
  
}

var PORT = process.env.PORT || 3000

app.listen(PORT, function(){
    console.log('listening on port 3000');
})