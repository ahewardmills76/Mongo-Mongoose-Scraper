var express = require('express');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var request = require('request');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');

var app = express();

app.use(express.static('public'))
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


app.get('/', function(req, res) {
   res.render('home',{ test : "this is a test" });
   
});

app.get('/scrape', function(req, res){
    scrape(function(data){
        console.log(data, "---- this is the data");
        res.render('home', data);
    });
});

function scrape(cb) {
    // Making a request for reddit's "webdev" board. The page's HTML is passed as the callback's third argument
request("https://old.reddit.com/r/webdev/", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);
  
    // An empty array to save the data that we'll scrape
    var results = [];
  
    // With cheerio, find each p-tag with the "title" class
    // (i: iterator. element: the current element)
    $("p.title").each(function(i, element) {
  
      // Save the text of the element in a "title" variable
      var title = $(element).text();
  
      // In the currently selected element, look at its child elements (i.e., its a-tags),
      // then save the values for any "href" attributes that the child elements may have
      var link = $(element).children().attr("href");
  
      // Save these results in an object that we'll push into the results array we defined earlier
      results.push({
        title: title,
        link: link
      });
    });
    cb(results);
    // Log the results once you've looped through each of the elements found with cheerio
  
  });
  
}



app.listen(3000, function(){
    console.log('listening on port 3000');
})