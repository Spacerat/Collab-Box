
var express = require('express');
var jqtpl = require('jqtpl');
var util = require('util');
var boxserver = require('./boxserver');

//Configure the web server.
var app = express.createServer();
var site_title = "Collab Box";

app.configure(function() {
    app.use(express.staticProvider(__dirname + '/static'));
    app.use(express.bodyDecoder());
    
    app.use(express.cookieDecoder());
    app.use(express.session());
    
    app.set("view engine", "html");
    app.set("view options", {layout: true});
    app.register( ".html", jqtpl);
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.logger());
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

boxserver.Server(app);

////
//Web Pages
////

//Index page: a list of games.
app.get('/', function(req, res) {
    head = res.partial('index_head');
    res.render('index', {locals: {
        title: site_title,
        head: head
    }});
});

app.get('/about', function(req, res) {
    res.render('about',{locals: {title: site_title}});
});


//Start the server.
app.listen(8200);

