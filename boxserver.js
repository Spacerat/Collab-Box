
//var io = require('socket.io');
var io = require('./../socket.io');
var util = require('util');



/*
Collabbox socket server class. No public members. Starts when instantiated with Server(app/server)
*/
this.Server = function(app) {
    var socket = io.listen(app);
    var text = "Type stuff!";
    
    socket.on('connection', function(client) {
        
        //client.typing stores whatever the client is currently typing, reset about 3 seconds after they stop typing.
        client.typing="";
        client.name="Anonymous";
        
        //clientobj(client) returns a simpler object representing the client, for sending to clients.
        var clientobj = function(cl) {
            return {
                sessionId: cl.sessionId,
                typing: cl.typing,
                name: cl.name
            }
        }
        
        //clientlist() returns a list of clients in clientobj() form.
        var clientlist = function() {
            var clients = {};
            for (id in socket.clients) {
                clients[id] = clientobj(socket.clients[id]);
            }
            return clients;
        }
        
        //Send all current data to the new client.
        client.send({
            full_update: text,
            clients: clientlist(),
            you: client.sessionId
        });
        
        //Let other clients know of the new connection.
        socket.broadcast({newclient: clientobj(client)}, client.sessionId);
        
        //typingResetTimeout is a timer ID, reset every time the client types.
        var typingResetTimeout = null;
        
        client.on('message',function(data, sender) {
            if ('rename' in data) {
                client.name = data.rename;
                socket.broadcast({clients: clientlist()});
            }
            if ('write' in data) {
                
                //Figure out how to update the text based on the input.
                write = data.write;
                var prevtext = text;
                var slice1 = text.slice(0, write.start);
                var slice2 = text.slice(write.start + write.del + write.text.length);
                text = slice1 + write.text + slice2;

                //Reconstruct the packet to send, in order to prevent clients from distributing whatever they want.
                var packet = {
                    text: write.text,
                    start: write.start,
                    del: write.del,
                    sessionId: client.sessionId
                }
                
                if (prevtext !== text) { //No need to send anything if nothing has changed.
                
                    //Determine whether this is a new phrase, or whether the text is part of the current message.
                    //Every time new data is recieved, a timer is reset to 3500ms. If the timer reaches 0, 
                    //the next packet sent will contain newphrase=true.  
                    client.typing += write.text;
                
                    if (typingResetTimeout) clearTimeout(typingResetTimeout);
                    typingResetTimeout = setTimeout(function () {
                        client.newphrase = true;
                        client.typing = "";
                    },3500);
                    if (client.newphrase) {
                        packet.newphrase = true;
                        client.newphrase = false;
                    }
                    
                    //Finally, broadcast the finished packet.
                    socket.broadcast({'write': packet},client.sessionId);
                }
            }
        });
        
        //Send the Id of disconnecting clients to all other clients.
        client.on('disconnect',function() {
            setTimeout(function() {
                socket.broadcast({disconnect: client.sessionId}, client.sessionId);
            },100);
        });
        
    });
}

