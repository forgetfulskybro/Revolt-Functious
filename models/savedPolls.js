const { Schema, model } = require("mongoose");

const savedPolls = new Schema({
    owner: { type: String },
    desc: { type: String },
    options: { type: Object },
});

module.exports = model("savedPolls", savedPolls); 
