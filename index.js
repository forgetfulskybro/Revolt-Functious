const { Client } = require("revolt.js");
const { Collection } = require('@discordjs/collection')
const { token, mongoDB } = require("./botconfig.json");
const Uploader = require("revolt-uploader"); // Thanks to ShadowLp174 for the cool package.

const client = new Client();
client.Uploader = new Uploader(client);
client.config = require("./config");
client.reactions = new Map();
client.paginate = new Map();
client.timeout = new Map();
client.polls = new Map();
client.used = new Map();

const mongoose = require("mongoose");
mongoose.set('strictQuery', true)
mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

["aliases", "commands", "events", "functions"].forEach(x => client[x] = new Collection());
["command", "event", "function"].forEach(x => require(`./handlers/${x}`)(client));

process.on("unhandledRejection", (reason, p) => {
    console.log(" [Error_Handling] :: Unhandled Rejection/Catch");
    console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
    console.log(" [Error_Handling] :: Uncaught Exception/Catch");
    console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(" [Error_Handling] :: Uncaught Exception/Catch (MONITOR)");
    console.log(err, origin);
});

client.loginBot(token);