var express = require('express');
var jqtpl = require('jqtpl');

var app = express.createServer();

app.configure(function() {
    
    app.set("view engine", "html");
    app.set("view options", {layout: false});
    app.set("view engine", "html");
    app.register( ".html", jqtpl);
});

//Index, containing the collab box.
app.get('/', function(req, res) {
    res.render('index',{debug:true});
});

//Start the server.
app.listen(8200);
