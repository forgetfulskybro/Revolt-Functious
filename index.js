const { Client } = require("revolt.js");
const { Collection } = require('@discordjs/collection');
const { token, mongoDB, RBL, MainBot } = require("./botconfig.json");
const fetch = require("wumpfetch");

const checkGiveaways = require("./functions/checkGiveaways");
const giveawaysEnd = require("./functions/giveawaysEnd");
const checkPolls = require("./functions/checkPolls");
const color = require("./functions/colorCodes");

const SavedPolls = require(`./models/savedPolls`);
const Giveaways = require("./models/giveaways");

const client = new Client();
const Uploader = require("revolt-uploader");
const TranslationHandler = require('./handlers/translation');
const DatabaseHandler = require('./handlers/database');
const checkRoles = require("./functions/checkRoles");

client.Uploader = new Uploader(client);
client.config = require("./config");
client.translate = new TranslationHandler();

client.database = new DatabaseHandler(mongoDB);
client.database.connectToDatabase();
client.database.cacheSweeper(client);
client.database.guildSweeper(client);

["reactions", "paginate", "timeout", "polls", "used", "messageCollector"].forEach(x => client[x] = new Map());
["aliases", "commands", "event", "functions"].forEach(x => client[x] = new Collection());
["command", "event", "function"].forEach(x => require(`./handlers/${x}`)(client));

client.once("ready", async () => {
  console.log(color("%", `%2[Bot_Ready]%7 :: ${client.user.username} is ready`));

  await checkPolls(client);
  await checkGiveaways(client);
  await giveawaysEnd(client);
  await checkRoles(client);

  if (client.user.id === MainBot) {
    setInterval(async () => {
      fetch(`https://revoltbots.org/api/v1/bots/stats`, {
        method: 'POST',
        headers: {
          server_count: client.servers.size(),
          'Authorization': RBL,
        }
      }).send();
    }, 3600000)
  }

  setInterval(async () => {
    let dbEntry, num = Math.floor(Math.random() * 3);
    if (num === 1) dbEntry = await Giveaways.find();
    if (num === 2) dbEntry = await SavedPolls.find();
    let statuses = [`${client.config.prefix}help | ${client.servers.size()} servers`, `${client.config.prefix}help | ${dbEntry?.length} giveaways`, `${client.config.prefix}help | ${dbEntry?.length} polls`];
    client.user.edit({ status: { text: statuses[num], presence: "Focus" } }).catch(() => { });
  }, 300000);
});


process.on("unhandledRejection", (reason, p) => {
  console.log(color("%", "%4[Error_Handling] :: Unhandled Rejection/Catch%c"));
  console.log(reason);
});
process.on("uncaughtException", (err, origin) => {
  console.log(color("%", "%4[Error_Handling] :: Uncaught Exception/Catch%c"));
  console.log(err);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(color("%", "%4[Error_Handling] :: Uncaught Exception/Catch (MONITOR)%c"));
  console.log(err);
});

client.loginBot(token);