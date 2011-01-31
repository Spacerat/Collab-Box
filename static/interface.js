

EditableLine = function(parent, id, value, onchange) {
    
    var span
    span = document.createElement("span");
    span.id = id;
    span.className = 'renamable';
    span.innerHTML = value;
    parent.appendChild(span);
    

    span.onclick = function() {
        //alert("!");
        var input = document.createElement("input");
        input.value = span.innerHTML;
        parent.replaceChild(input, span);
        input.focus();
        var set = function() {
            span.innerHTML = input.value;
            try {
                parent.replaceChild(span, input);
            }
            catch(e) {
                //Despite the ERR_NOT_FOUND always emitted here, it seems to work fine...
            }
            if (onchange) {onchange(span.innerHTML);}
        }
        input.onblur = set;
        input.onchange = set;
        
    }


    
} 

function StartCollabbox(callback) {
    window.onload = function() {
        setTimeout(function() {
            var box = document.getElementById("status");
            var playerlist = document.getElementById("playerlist");
            var client = new BoxClient(null, "textarea");
            client.onconnect = function() {
                box.style.display = 'none';
            }
            client.ondisconnect = function() {
                box.style.display = 'block';
                box.innerHTML = "Disconnected";
            }
            client.onclientsupdate = function(list) {
                playerlist.innerHTML = "";
                for (var id in list) {
                    if (id !== this.sessionId) {
                        span = playerlist.appendChild(document.createElement("span"));
                        span.id = id;
                        span.innerHTML = list[id].name;
                        span = playerlist.appendChild(document.createElement("span"));
                        span.id = id+"_typing";
                        span.innerHTML = ": "+list[id].typing;
                    }
                    else if (id == this.sessionId) {
                        new EditableLine(playerlist, id, list[id].name, function(name) {
                            //Called when the player changes their name
                            client.rename(name)
                        });    
                    }
                    playerlist.appendChild(document.createElement("br"));
 
                }
            }
            client.ontyping = function(text, id) {
                document.getElementById(id+"_typing").innerHTML=": "+text;
            }
            client.start();
            if (callback) callback(client);
        }, 100);
    }
}
