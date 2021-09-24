const express = require("express");
const router = express.Router();
const fs = require("fs");
const auth = require("../middleware/auth");

router.get("/messages", auth, (req, res) => {
    var messages = JSON.parse(fs.readFileSync("./messages.json"));
    messages = messages.filter(message => message.exprires_at > Date.now());
    fs.writeFileSync("./messages.json", JSON.stringify(messages));
    res.status(200).json({code: 200, messages: messages});
}); 

module.exports = router;