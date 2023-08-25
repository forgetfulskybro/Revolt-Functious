const Embed = require("../functions/embed");
const Giveaway = require("../models/giveaways");
const SavedPolls = require("../models/savedPolls");
const { dependencies } = require("../package.json");
module.exports = {
    config: {
        name: "info",
        usage: false,
        cooldown: 10000,
        available: true,
        permissions: [],
        aliases: ["stats"]
    },
    run: async (client, message, args, db) => {
        const unixstamp = client.functions.get("fetchTime")(Math.floor(process.uptime() * 1000), client, db.language)
        let beforeCall = Date.now();
        const polls = await SavedPolls.find();
        let dbPing = Date.now() - beforeCall;

        const embed = new Embed()
            .setDescription(`### ${client.translate.get(db.language, 'Commands.info.start')}\n${client.translate.get(db.language, 'Commands.info.servers')}: ${client.servers.size().toLocaleString()}\n${client.translate.get(db.language, 'Commands.info.giveaways')}: ${(await Giveaway.find()).length.toLocaleString()}\n${client.translate.get(db.language, 'Commands.info.polls')}: ${polls.length.toLocaleString()}\n${client.translate.get(db.language, 'Commands.info.uptime')}: ${unixstamp}\n\n${client.translate.get(db.language, 'Commands.info.ping')}: ${client.events.ping()}ms\n${client.translate.get(db.language, 'Commands.info.database')}: ${dbPing}ms\n${client.translate.get(db.language, 'Commands.info.library')}: Revolt.js | ${dependencies["revolt.js"]}\n\n### ${client.translate.get(db.language, 'Commands.info.links')}\n[${client.translate.get(db.language, 'Commands.info.links2')}](https://app.revolt.chat/bot/${client.user.id}) | [${client.translate.get(db.language, 'Commands.info.links3')}](https://rvlt.gg/functious) | [GitHub](https://github.com/forgetfulskybro/Revolt-Functious)`)
            .setColor(`#A52F05`);

        message.reply({ embeds: [embed] }, false)
    },
};
