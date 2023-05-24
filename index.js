const { Client } = require("revolt.js");
const { Collection } = require('@discordjs/collection');
const Giveaways = require("./models/giveaways");
const SavedPolls = require(`./models/savedPolls`);
const checkPolls = require("./functions/checkPolls");
const checkGiveaways = require("./functions/checkGiveaways");
const giveawaysEnd = require("./functions/giveawaysEnd");

const { token, mongoDB } = require("./botconfig.json");
const Uploader = require("revolt-uploader"); // Thanks to ShadowLp174 for the cool package.

const client = new Client();
client.Uploader = new Uploader(client);
client.config = require("./config");

const mongoose = require("mongoose");
mongoose.set('strictQuery', true)
mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

["reactions", "paginate", "timeout", "polls", "used"].forEach(x => client[x] = new Map());
["aliases", "commands", "event", "functions"].forEach(x => client[x] = new Collection());
["command", "event", "function"].forEach(x => require(`./handlers/${x}`)(client));

client.once("ready", async () => {
    console.log(`${client.user.username} is ready!`);

    await checkPolls(client);
    await checkGiveaways(client);
    await giveawaysEnd(client);

    setInterval(async () => {
        let dbEntry, num = Math.floor(Math.random() * 3);
        if (num === 1) dbEntry = await Giveaways.find();
        if (num === 2) dbEntry = await SavedPolls.find();
        let statuses = [`${client.config.prefix}help | ${client.servers.size()} servers`, `${client.config.prefix}help | ${dbEntry?.length} giveaways`, `${client.config.prefix}help | ${dbEntry?.length} polls`];
        client.user.edit({ status: { text: statuses[num], presence: "Focus" } });
    }, 300000);
});

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