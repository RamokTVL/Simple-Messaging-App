const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");

router.post("/login", async(req, res) => {
    //On vérifie si l'email et le mot de passe sont dans le body, en string, et que l'email est au format valide
    if(!req.body.email || !req.body.password || typeof(req.body.email) != "string" || typeof(req.body.password) != "string" || !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email)) return res.status(400).send("").end();
    //On vérifie si le mot de passe est assez sécurisé
    if(req.body.password.length < 5) return res.status(400).send("Votre mot de passe doit être plus long que 5 charactères").end();
    //Lecture de la base de donnée
    var db = fs.readFileSync("src/db.json");
    db = JSON.parse(db);
    //On vérifie si la base de donnée contient l'email de l'utilisateur
    if(!db[req.body.email]) return res.status(404).send({code: 404, message: "Impossible de trouver votre compte"}).end();
    
    //On regarde si le mot de passe est identique a celui dans la database
    bcrypt.compare(req.body.password, db[req.body.email]["password"], (e,r) => {
        if(e) return res.status(500).send("An error occured.").end();
        //On crée le token
        let token = jwt.sign({
            user: db[req.body.email]
        }, require("../index").secret, {
            expiresIn: '24h'
        });
        //On envoi le token a l'utilsateur
        res.status(200).json({token: token}).end();
    });
});

module.exports = router;