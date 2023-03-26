const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    owner: { type: String },
    channelId: { type: String },
    messageId: { type: String },
    avatars: { type: Object },
    votes: { type: Object },
    users: { type: Object },
    time: { type: Number },
    now: { type: Number },
    desc: { type: String },
    options: { type: Object },
});

module.exports = mongoose.model("polls", Schema); 
