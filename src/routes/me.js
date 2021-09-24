//Pour acceder a ceci, il faut être connecté
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.get("/me", authMiddleware, (req, res) => {
    //L'utilisateur est connecté.

    //Pour obtenir les informations du compte par le logiciel
    if(req.query.raw == "true") {
        res.status(200).json({
            username: req.user.user.username,
            creation_date: req.user.user.creation_date
        }).end();
    } else {
        res.send(`Vous êtes connecté, bienvenue ${req.user.user.username}, vous avez crée votre compte le ${dateToString(new Date(req.user.user.creation_date))}`)
    }
    
}); 


function dateToString(date1) {
    //On passe la date en un format plus beau et compréhensible.
    var day = date1.getDate();
    if(String(day).length == 1) day = "0" + day;
    
    var mois = date1.getMonth();
    if(String(mois).length == 1) mois = "0" + mois;

    var année = date1.getFullYear();
    
    var heures = date1.getHours();
    if(String(heures).length == 1) heures = "0" + heures;

    var minutes = date1.getMinutes();
    if(String(minutes).length == 1) minutes = "0" + minutes;

    return `${day}/${mois}/${année} à ${heures}:${minutes}`
}

module.exports = router;