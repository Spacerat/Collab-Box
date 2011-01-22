
var io = require('socket.io');
//var io = require('./../socket.io');
var util = require('util');

this.Server = function(app) {
    var socket = io.listen(app);
    var text = "Default text";
    
    socket.on('connection', function(client) {
        //new client
        
        var clientlist = function() {
            var list = Array();
            for (id in socket.clients) {
                list.push(id);
            }
            return list;
        }
        
        client.send({
            full_update: text,
            clients: clientlist(),
            you: client.sessionId
        });
        socket.broadcast({clients: clientlist()}, client.sessionId);
        
        client.on('message',function(data, sender) {
            if ('write' in data) {
                write = data.write;
                var slice1 = text.slice(0, write.start);
                var slice2 = text.slice(write.start + write.del + write.text.length);
                text = slice1 + write.text + slice2;
                socket.broadcast(data,client.sessionId);
            }
        });
        
        client.on('disconnect',function() {
            setTimeout(function() {
                socket.broadcast({clients: clientlist()}, client.sessionId);
            },100);
        });
        
    });
}

