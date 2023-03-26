const Embed = require("../functions/embed")
const Giveaway = require("../models/giveaways")
const SavedPolls = require("../models/savedPolls")
module.exports = {
    config: {
        name: "info",
        description: "Stats on the bot",
        usage: "",
        cooldown: 5000,
        available: true,
        permissions: [],
        aliases: ["stats"]
    },
    run: async (client, message, args) => {
        const unixstamp = Math.floor((Date.now() / 1000) | 0) - Math.floor(client.websocket.heartbeat._idleStart / 1000);
        let beforeCall = Date.now();
        const polls = await SavedPolls.find();
        let dbPing = Date.now() - beforeCall;
        const giveaways = await Giveaway.find();

        const embed = new Embed()
            .setDescription(`### Random Statistics\n\nServers: ${client.servers.size.toLocaleString()}\nGiveaways: ${giveaways.length.toLocaleString()}\nPolls: ${polls.length.toLocaleString()}\nDatabase: ${dbPing}ms\nPing: ${client.websocket.ping.toLocaleString()}ms\nUptime: <t:${unixstamp}:R>`)
            .setColor(`#A52F05`);

        message.reply({ embeds: [embed] })
    },
};
