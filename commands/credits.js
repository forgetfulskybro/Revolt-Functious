const Embed = require("../functions/embed.js");
const translators = ["01H030RQVSNHK6XZV3SRZBEDPT", "01GNAK3S9A677WSN41EG3GQAVC", "01FVB1ZGCPS8TJ4PD4P7NAFDZA", "01G9MCW5KZFKT2CRAD3G3B9JN5"];
module.exports = {
    config: {
        name: "credits",
        cooldown: 5000,
        available: true,
        usage: false,
        permissions: [],
        aliases: ["creds", "cred"]
    },
    run: async (client, message, args, db) => {
        const embed = new Embed()
            .setTitle(client.translate.get(db.language, "Commands.credits.title"))
            .setDescription(`${client.translate.get(db.language, "Commands.credits.thankyou")}\n${client.translate.get(db.language, "Commands.credits.thankyou2")}\n\n**${client.translate.get(db.language, "Commands.credits.translators")}**:\n${translators.map(t => `<@${t}>`).join("\n")}`)

        message.reply({ embeds: [embed] }, false)
    },
};
