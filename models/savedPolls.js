const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    owner: { type: String },
    desc: { type: String },
    options: { type: Object },
});

module.exports = mongoose.model("savedPolls", Schema); 
