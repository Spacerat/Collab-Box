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
                playerlist.innerHTML+=id+": ";
                playerlist.innerHTML+=list[id].typing;
                if (id == this.sessionId) {playerlist.innerHTML+=' <--- you';}
                playerlist.innerHTML+= '<br />';
            }
        }
        client.start();
    }, 100);
}
