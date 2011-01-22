
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
    var that = this;
    
    this.start = function() {
        socket.connect();
    }
    
    
    socket.on('connect', function() {
        if (that.onconnect) that.onconnect();
    });
    
    socket.on('disconnect', function() {
        if (that.ondisconnect) that.ondisconnect();
    });
    
    
    //Recieve data
    socket.on('message', function(data) {
        if ('you' in data) {
            that.sessionId = data.you;
        }    
        if ('full_update' in data) {
            textbox.value = data.full_update;
            prevtext = textbox.value;
        }
        if ('clients' in data) {
            if (that.onclientsupdate) that.onclientsupdate(data.clients);
        }
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
