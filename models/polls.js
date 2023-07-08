const { Schema, model } = require("mongoose");

const polls = new Schema({
    owner: { type: String },
    serverId: { type: String },
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

module.exports = model("polls", polls); 
