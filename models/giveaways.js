const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    owner: { type: String, required: true },
    serverId: { type: String, required: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
    users: [{ type: Object }],
    time: { type: String, required: true },
    now: { type: String, required: true },
    prize: { type: String, required: true },
    winners: { type: Number, required: true },
    pickedWinners: [{ type: Object }],
    picking: [{ type: Object }],
    ended: { type: Boolean, default: false },
    requirement: { type: String },
    endDate: { type: String }
});

module.exports = mongoose.model("giveaways", Schema);
