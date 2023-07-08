const { Schema, model } = require("mongoose");

const guilds = new Schema({
    id: { type: String },
    prefix: { type: String, default: "f!" },
    language: { type: String, default: "en_EN" },
    joined: { type: String, default: Date.now() / 1000 | 0 },
    dm: { type: Boolean, default: true },
    roles: { type: Array, default: [] },
});

module.exports = model("guilds", guilds); 
