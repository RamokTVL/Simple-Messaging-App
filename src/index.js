//On utilise bcrypt pour sécuriser les mot de passes
const bcrypt = require("bcrypt");
//On utilise le module file system intégré par défault dans nodejs pour lire les fichiers de la base de donnée 
const fs = require("fs");
//On utilise le module express pour créer une API qui va nous servir a authentifier le client
const express = require("express");
const http = require("http");
//On déclare la variable app
const app = express();
//On crée le serveur http
const server = http.createServer(app);
//On crée le websocket pour poster et recevoir les messages
const ws = require("ws");
const wss = new ws.WebSocketServer({ server });
const jwt = require("jsonwebtoken");
module.exports.secret = "HLky&4aJJ!oQ#5fB"; //notre clé de chiffrement pour les tokens


//On utilise express.json pour récupérer le body des requêtes faites avec le header Content-Type en application/json
app.use(express.json());
//On déclare la varibable routes qui va contenir les fichiers des endpoints du serveur.
//On utilise l'option withFileTypes pour être sur qu'on va utiliser que des fichiers en .js

var files = fs.readdirSync("src/routes", {withFileTypes: true})
var routes = files.filter(dirent => dirent.isFile() && dirent.name.endsWith(".js"));
//Pour tous les fichiers qui ont passé le filtre, on les ajoute a l'API
routes.forEach(route => {
    const endpoint = require("./routes/" + route.name);
    app.use(endpoint);
});

wss.on("connection", function connection(ws, request, client) {
    ws.send(JSON.stringify({
        op: 1,
        d: "Please send me your token"
    }));

    ws.on('message', function incoming(message) {

        try {
            JSON.parse(message);
        } catch(e) {
            return ws.close();
        }

        const content = JSON.parse(message);
        if(!content.op || !typeof(content.op) == "number" || !content.d || !typeof(content.d) == "string") {
            return ws.close();
        }

        switch(content.op) {
            case 2:
           //     console.log(content.d.token);
                if(!content.d.token) return ws.close();

                try {
                    var decoded = jwt.verify(content.d.token, require("./index.js").secret);

                    ws.user = decoded;
                    ws.send("Connected");
                }catch(err) {
                    return ws.close();
                }
                break;
            case 4:
                if(!content.t || !typeof(content.t) == "string") {
                    return ws.close();
                }

                switch(content.t) {
                    case "message":
  
                        wss.clients.forEach(client => {
                            const msg =                             {
                                user: ws.user.user.username,
                                message: content.d,
                                created_at: new Date(),
                                exprires_at: Date.now() + 600000
                            };
                            const messages = JSON.parse(fs.readFileSync("./messages.json"))
                            messages.push(msg);
                            fs.writeFileSync("./messages.json", JSON.stringify(messages));
                            client.send(JSON.stringify(msg));
                        });
                        break;
                }
                break;
        }


      });
});

//On fait écouter le serveur sur le port 80
server.listen(80, () => {console.log("L'application écoute le port 80")});