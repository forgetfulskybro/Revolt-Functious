const { Schema, model } = require("mongoose");

const giveaways = new Schema({
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
    lang: { type: String, required: true, default: "en_EN" },
    requirement: { type: String },
    endDate: { type: String }
});

module.exports = model("giveaways", giveaways);
