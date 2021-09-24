const jwt = require("jsonwebtoken");
const fs = require("fs");

module.exports = (req, res, next) => {
    //Ceci est un middleware, ça sert a éxécuter une fonction avant l'endpoint, et on va utiliser ça pour vérifier si la personne est connectée
    var db = fs.readFileSync("src/db.json");
    db = JSON.parse(db);
    const inputtkn = req.headers.authorization;
    if(!inputtkn) return res.status(401).send("").end();
    
    try {
        var decoded = jwt.verify(inputtkn, require("../index").secret);
        
        req.user = decoded;
        next();
      } catch(err) {
        return res.status(401).send("Unauthorized").end();
      }
}