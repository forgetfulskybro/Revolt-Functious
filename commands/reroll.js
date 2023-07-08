const Embed = require(`../functions/embed`)
const Giveaways = require(`../models/giveaways`)

module.exports = {
    config: {
        name: `reroll`,
        usage: true,
        cooldown: 5000,
        permissions: ["ManageServer"],
        available: true,
        aliases: ["rr"]
    },
    run: async (client, message, args, db) => {
        let winners;
        let picked = [];
        const options = args.join(` `).split(`|`).map(x => x.trim()).filter(x => x);
        const msgId = options[0];
        if (!msgId) return message.reply({ embeds: [new Embed().setDescription(client.translate.get(db.language, "Commands.reroll.validID")).setColor(`#FF0000`)] }, false);

        const check = await Giveaways.findOne({ messageId: msgId });
        if (!check) return message.reply({ embeds: [new Embed().setDescription(client.translate.get(db.language, "Commands.reroll.notValid")).setColor(`#FF0000`)] }, false);
        winners = options[1] ? options[1] : check.winners === 1 ? winners = 1 : null;
        if (!winners) return message.reply({ embeds: [new Embed().setDescription(client.translate.get(db.language, "Commands.reroll.winners")).setColor(`#FF0000`)] }, false);
        if (winners !== "all" && isNaN(winners) || winners > 5 || winners < 1) return message.reply({ embeds: [new Embed().setDescription(client.translate.get(db.language, "Commands.reroll.winners")).setColor(`#FF0000`)] }, false);

        if (!check.ended) return message.reply({ embeds: [new Embed().setDescription(client.translate.get(db.language, "Commands.reroll.notEnded")).setColor(`#FF0000`)] }, false);
        if (check.owner !== message.authorId) return message.reply({ embeds: [new Embed().setDescription(client.translate.get(db.language, "Commands.reroll.notHosted")).setColor(`#FF0000`)] }, false);
        if (check.users.length === 0) return message.reply({ embeds: [new Embed().setDescription(client.translate.get(db.language, "Commands.reroll.noUsers")).setColor(`#FF0000`)] }, false)
        if (check.picking.length === 0) return message.reply({ embeds: [new Embed().setDescription(client.translate.get(db.language, "Commands.reroll.noPicks")).setColor(`#FF0000`)] }, false)

        if (winners === "all") {
            check.pickedWinners = [];
            for (let i = 0; i < check.winners; i++) {
                let winner = check.picking[Math.floor(Math.random() * check.picking.length)];
                if (winner) {
                    const filtered = check.picking.filter(object => object.userID != winner.userID)
                    check.picking = filtered;
                    check.pickedWinners.push({ id: winner.userID })
                    picked.push({ id: winner.userID })
                }
            }
            await check.save();
        } else {
            if (winners > check.pickedWinners.length) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.reroll.onlyWinners")} ${check.pickedWinners.length} ${client.translate.get(db.language, "Commands.reroll.onlyWinners2")}: \`${client.config.prefix}reroll ${msgId} [${client.translate.get(db.language, "Commands.reroll.winnerNum")}, E.g. 1, 2, all] \``).setColor(`#FF0000`)] }, false)

            let winner = check.picking[Math.floor(Math.random() * check.picking.length)];
            const filtered = check.picking.filter(object => object.userID != winner.userID)
            check.picking = filtered;
            const filtered2 = check.pickedWinners.filter(object => object.id != check.pickedWinners[winners - 1].id)
            check.pickedWinners = filtered2;
            check.pickedWinners.push({ id: winner.userID })
            await check.save();
            picked.push({ id: winner.userID })
        }

        const embed = new Embed()
            .setColor("#A52F05")
            .setTitle(client.translate.get(db.language, "Commands.reroll.giveaway"))
            .setDescription(`${client.translate.get(db.language, "Commands.reroll.owner")} (<@${check.owner}>) ${client.translate.get(db.language, "Commands.reroll.rerolled")} ${winners === "all" ? client.translate.get(db.language, "Commands.reroll.winners1") : `${client.translate.get(db.language, "Commands.reroll.winners2")} ${winners}`}\n${client.translate.get(db.language, "Commands.reroll.partici")}: ${check.users.length}\n\n${client.translate.get(db.language, "Commands.reroll.ended")}: <t:${Math.floor((check.endDate) / 1000)}:R>\n${client.translate.get(db.language, "Commands.reroll.prize")}: ${check.prize}\n${client.translate.get(db.language, "Commands.reroll.winner")}: ${check.pickedWinners.map(w => `<@${w.id}>`).join(", ")}${check.requirement ? `\n${client.translate.get(db.language, "Commands.reroll.reqs")}: ${check.requirement}` : ``}`)

        await client.api.post(`/channels/${check.channelId}/messages`, { "content": `${client.translate.get(db.language, "Commands.reroll.reroll")} ${picked.map(w => `<@${w.id}>`).join(", ")} ${client.translate.get(db.language, "Commands.reroll.reroll2")} **[${check.prize}](https://app.revolt.chat/server/${check.serverId}/channel/${check.channelId}/${check.messageId})**!` }).catch((e) => { return message.reply(`${client.translate.get(db.language, "Commands.reroll.error")}: ${e.message}`, false) })
        return await client.api.patch(`/channels/${check.channelId}/messages/${check.messageId}`, { "embeds": [embed] }).catch((e) => { return message.reply(`${client.translate.get(db.language, "Commands.reroll.error2")}: ${e.message}`, false) })
    },
};
