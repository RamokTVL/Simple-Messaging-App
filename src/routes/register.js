const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");

router.post("/register", async(req, res) => {
    //On vérifie si l'email et le mot de passe sont dans le body, en string, et que l'email est au format valide
    if(!req.body.email || !req.body.password || typeof(req.body.email) != "string" || typeof(req.body.password) != "string" || !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email)) return res.status(400).send("").end();
    //On vérifie si le mot de passe est assez sécurisé
    if(req.body.password.length < 5) return res.status(400).send("Votre mot de passe doit être plus long que 5 charactères").end();
    //Lecture de la base de donnée
    var db = fs.readFileSync("src/db.json");
    db = JSON.parse(db);
    //On vérifie si la base de donnée contient l'email de l'utilisateur
    if(db[req.body.email]) return res.status(406).send("Ce compte existe déjà").end();

    //On crée le hash du mot de passe pour éviter les problèmes en cas de leak de la base de donnée
    bcrypt.genSalt(12, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            //On enregistre l'utilisateur
            db[req.body.email] = {
                username: req.body.email.split("@")[0],
                password: hash,
                creation_date: Date.now(),
            }

            //On sauvegarde la base de donnée
            fs.writeFileSync("src/db.json", JSON.stringify(db));

            //On crée le token
            let token = jwt.sign({
                user: db[req.body.email]
            }, require("../index").secret, {
                expiresIn: '24h'
            });

            //On envoi le token a l'utilisateur
            res.status(200).json({token: token}).end();
        });
    });

    
});

module.exports = router;