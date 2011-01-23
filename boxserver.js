
var io = require('socket.io');
//var io = require('./../socket.io');
var util = require('util');

this.Server = function(app) {
    var socket = io.listen(app);
    var text = "Default text";
    
    socket.on('connection', function(client) {
        //new client
        client.typing="";
        var clientobj = function(cl) {
            return {
                sessionId: cl.sessionId,
                typing: cl.typing
            }
        }        
        var clientlist = function() {
            var clients = {};
            for (id in socket.clients) {
                clients[id] = clientobj(socket.clients[id]);
            }
            return clients;
        }
        client.send({
            full_update: text,
            clients: clientlist(),
            you: client.sessionId
        });
        socket.broadcast({clients: clientlist()}, client.sessionId);
        
        var typingResetTimeout = null;
        
        client.on('message',function(data, sender) {
            if ('write' in data) {
                write = data.write;
                var prevtext = text;
                var slice1 = text.slice(0, write.start);
                var slice2 = text.slice(write.start + write.del + write.text.length);
                text = slice1 + write.text + slice2;
                client.typing += write.text;
                
                //Reconstruct the packet to send, in order to prevent clients from distributing whatever they want
                var packet = {
                    text: write.text,
                    start: write.start,
                    del: write.del,
                    sessionId: client.sessionId
                }
                
                if (prevtext !== text) {
                    if (typingResetTimeout) clearTimeout(typingResetTimeout);
                    typingResetTimeout = setTimeout(function () {
                        client.newphrase = true;
                        client.typing = "";
                    },3500);
                    if (client.newphrase) {
                        packet.newphrase = true;
                        client.newphrase = false;
                    }
                    util.log(util.inspect(packet));
                    socket.broadcast({'write': packet},client.sessionId);
                }
            }
        });
        
        client.on('disconnect',function() {
            setTimeout(function() {
                socket.broadcast({disconnect: client.sessionId}, client.sessionId);
            },100);
        });
        
    });
}

