const Embed = require("../functions/embed");
const Giveaway = require("../models/giveaways");
const SavedPolls = require("../models/savedPolls");
const { dependencies } = require("../package.json");
module.exports = {
    config: {
        name: "info",
        description: "Stats on the bot",
        usage: "",
        cooldown: 5000,
        available: true,
        permissions: [],
        aliases: ["stats", ]
    },
    run: async (client, message, args) => {
        const unixstamp = client.functions.get("fetchTime")(Math.floor(process.uptime() * 1000))
        let beforeCall = Date.now();
        const polls = await SavedPolls.find();
        let dbPing = Date.now() - beforeCall;
        const giveaways = await Giveaway.find();

        const embed = new Embed()
            .setDescription(`### Random Information\nServers: ${client.servers.size().toLocaleString()}\nGiveaways: ${giveaways.length.toLocaleString()}\nPolls: ${polls.length.toLocaleString()}\nUptime: ${unixstamp}\n\nPing: ${client.events.ping()}ms\nDatabase: ${dbPing}ms\nLibrary: Revolt.js | ${dependencies["revolt.js"]}\n\n### Links\n[Invite](https://app.revolt.chat/bot/${client.user.id}) | [Support](https://rvlt.gg/functious) | [GitHub](https://github.com/forgetfulskybro/Revolt-Functious)`)
            .setColor(`#A52F05`);

        message.reply({ embeds: [embed] }, false)
    },
};
