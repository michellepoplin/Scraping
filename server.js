var express = require('express');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');
var Article = require('./models/article');
var Note = require('./models/index');
var Index = require('./models/index');
var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mongoHeadlines';

mongoose.connect('mongodb://localhost:27017/articles', {useNewUrlParser: true});


var url = 'https://www.nytimes.com/'

axios(url, function (err, res, body) {
    //TODO test these classes to make sure it pulls what I want
    var load = cheerio.load(body);
    var Headline = load('.balancedHeadLine');
    var Summary = load('.css-1rrs2s3 e1n8kpyg1', "li");
})


var db = require('./models');

var PORT = 3000;

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    axios.get(url).then(function (response) {
        var $ = cheerio.load(response.data);

        $('article h2').each(function (i, element) {
            var result = {};

            result.title = $(this)
                .children('a')
                .text();
            result.link = $(this)
                .children('a')
                .attr('href');

            Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

        res.send('Scrape Complete');
    });
});

app.get('/article', function (req, res) {
    Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get('/article/:id', function (req, res) {
    Article.findOne({ _id: req.params.id })
        .populate('note')
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.post('/article/:id', function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});


app.listen(3000, function () {
    console.log('App running on port 3000!');
});
