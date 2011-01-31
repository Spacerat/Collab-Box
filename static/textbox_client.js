
/*
    Collaborative textbox class.
    url = url of node server (usually null)
    textarea_id = string id of the textarea to convert.
    
    Events:
    client.onconnect()
    client.ondisconnect()
    client.onclientsupdate(list)
    
*/
var BoxClient = function(url, textarea_id) {
    
    var socket= new io.Socket(url);
    var textbox = document.getElementById(textarea_id);
    var prevtext = "";
    var clients = {};
    var that = this;
    
    this.start = function() {
        socket.connect();
    }
    
    this.rename = function(name) {
        socket.send({'rename': name});
    }
    
    //Run the onconnect callback
    socket.on('connect', function() {
        if (that.onconnect) that.onconnect();
    });
    
    //Run the ondisconnect callback
    socket.on('disconnect', function() {
        if (that.ondisconnect) that.ondisconnect();
    });
    
    
    //Recieve data
    socket.on('message', function(data) {
    
        //The server sends the client's sessionId to the client on connection.
        if ('you' in data) {
            that.sessionId = data.you;
        }    
        
        //The entire contents of the text box.
        if ('full_update' in data) {
            textbox.value = data.full_update;
            prevtext = textbox.value;
        }
        
        //The full client list is sent to everyone on when anyone connects,
        //additionally, the onclientsupdate() callback is run.
        if ('clients' in data) {
            clients = data.clients;
            if (that.onclientsupdate) that.onclientsupdate(clients);
        }
        
        if ('newclient' in data) {
            clients[data.newclient.sessionId] = data.newclient;
            if (that.onclientsupdate) that.onclientsupdate(clients);
            if (that.onnewclient) that.onnewclient(data.newclient);
        }
        
        
        //Removes disconnecting clients and runs onclientsupdate()
        if ('disconnect' in data) {
            delete clients[data.disconnect];
            if (that.onclientsupdate) that.onclientsupdate(clients);
        }
        
        //Recieve typing data. 
        if ('write' in data) {
            write = data.write;
            var poss = textbox.selectionStart;
            var pose = textbox.selectionEnd;
            var t = textbox.value;
            write.del = parseInt(write.del,10);
            var slice1 = t.slice(0, write.start);
            var slice2 = t.slice(write.start + write.del + write.text.length);
            
            textbox.value = slice1 + write.text + slice2;
            prevtext = textbox.value;
            
            var diffs=0,diffe=0;
            if (write.start < poss) {
                diffs = - write.del;
            }
            if (write.start < pose) {
                diffe = - write.del;
            }
            
            if (write.newphrase) {
                clients[write.sessionId].typing = write.text;
            }
            else {
                clients[write.sessionId].typing += write.text;
            }

            if (that.ontyping) that.ontyping(clients[write.sessionId].typing, write.sessionId);
            
            textbox.selectionStart = poss + diffs;
            textbox.selectionEnd = pose + diffe;
            
        }
    });

    
    //Send typing data    
    textbox.onkeyup = function(argument) {
        var s = textbox.value;
        
        var startchange = -1;
        var pos = textbox.selectionStart;
        
        for (var c in s) {
            if (s[c] !== prevtext[c]) {
                startchange = parseInt(c,10);
                break;
            }
        }
        if (startchange===-1) {
            if (s.length<prevtext.length) {
                startchange=s.length;
            }
            else return;
        }
        
        var str = s.slice(startchange, pos);
        var deletelength = prevtext.length - textbox.value.length;
        
        
        socket.send({'write': {
            del: deletelength,
            start: startchange,
            text: str
        }});
        
        prevtext = textbox.value;
    }
};
