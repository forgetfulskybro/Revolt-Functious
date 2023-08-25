const Embed = require("../functions/embed")
module.exports = {
    config: {
        name: "language",
        usage: true,
        cooldown: 5000,
        available: true,
        permissions: ["ManageServer"],
        aliases: ["lang"]
    },
    run: async (client, message, args, db) => {
        const embed = new Embed()
            .setDescription(`**${client.translate.get(db.language, "Commands.language.current")}**: ${db.language}\n**${client.translate.get(db.language, "Commands.language.example")}**: ${db.prefix}language en_EN\n${client.translate.get(db.language, "Commands.language.change")}\n\n**${client.translate.get(db.language, "Commands.language.avail")}**: ${client.translate.availableLanguages.map(l => l).join(", ")}`)
            .setColor(`#A52F05`);

        if (!args[0]) return message.reply({ embeds: [embed] }, false);
        if (!client.translate.availableLanguages.includes(args[0])) return message.reply(client.translate.get(db.language, "Commands.language.notAvailable"), false);

        await client.database.updateGuild(message.server.id, { language: args[0] });
        message.reply(`${client.translate.get(args[0], "Commands.language.success")} **${args[0]}**`, false);
    },
};
