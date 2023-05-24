const Embed = require(`../functions/embed`)
const Giveaways = require(`../models/giveaways`)

module.exports = {
    config: {
        name: `reroll`,
        description: `Reroll winners from giveaways. Winner number is based on the order of the winners in the embed.`,
        usage: `[Message ID] [Winner Nummber, E.g. 1, 2, all | Default: all]`,
        cooldown: 5000,
        permissions: ["ManageServer"],
        available: true,
        aliases: ["rr"]
    },
    run: async (client, message, args) => {
        let winners;
        let picked = [];
        const options = args.join(` `).split(`|`).map(x => x.trim()).filter(x => x);
        const msgId = options[0];
        if (!msgId) return message.reply({ embeds: [new Embed().setDescription(`Please provide a message ID!`).setColor(`#FF0000`)] }, false);

        const check = await Giveaways.findOne({ messageId: msgId });
        if (!check) return message.reply({ embeds: [new Embed().setDescription(`I couldn't find a giveaway with that message ID!`).setColor(`#FF0000`)] }, false);
        winners = options[1] ? options[1] : check.winners === 1 ? winners = 1 : null;
        if (!winners) return message.reply({ embeds: [new Embed().setDescription(`Please provide a winner number (E.g. 1, 2, 3) or use \`all\` to reroll all winners!`).setColor(`#FF0000`)] }, false);
        if (winners !== "all" && isNaN(winners) || winners > 5 || winners < 1) return message.reply({ embeds: [new Embed().setDescription(`Please provide a valid winner number (E.g. 1, 2) or use \`all\` to reroll all winners!`).setColor(`#FF0000`)] }, false);

        if (!check.ended) return message.reply({ embeds: [new Embed().setDescription(`This giveaway hasn't ended yet!`).setColor(`#FF0000`)] }, false);
        if (check.owner !== message.authorId) return message.reply({ embeds: [new Embed().setDescription(`You can't reroll this giveaway because you didn't host it!`).setColor(`#FF0000`)] }, false);
        if (check.users.length === 0) return message.reply(`<@${check.owner}>, there are no users in this giveaway to reroll!`, false)
        if (check.picking.length === 0) return message.reply(`<@${check.owner}>, there are no more users for rerolling!`, false)

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
            if (winners > check.pickedWinners.length) return message.reply(`<@${check.owner}>, there are only ${check.pickedWinners.length} winner(s) to pick from!\nExample: \`${client.config.prefix}reroll ${msgId} [Winner Number, E.g. 1, 2, all] \``, false)

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
            .setTitle(`Giveaway`)
            .setDescription(`Owner (<@${check.owner}>) rerolled ${winners === "all" ? `all winners!` : `winner position ${winners}`}\nParticipants: ${check.users.length}\n\nEnded: <t:${Math.floor((check.endDate) / 1000)}:R>\nPrize: ${check.prize}\nWinner(s): ${check.pickedWinners.map(w => `<@${w.id}>`).join(", ")}${check.requirement ? `\nRequirement: ${check.requirement}` : ``}`)

        await client.api.post(`/channels/${check.channelId}/messages`, { "content": `The giveaway was rerolled! New winner(s) ${picked.map(w => `<@${w.id}>`).join(", ")} won the giveaway for **[${check.prize}](https://app.revolt.chat/server/${check.serverId}/channel/${check.channelId}/${check.messageId})**!` }).catch((e) => { return message.reply(`Unable to send message for new winners: ${e.message}`, false) })
        return await client.api.patch(`/channels/${check.channelId}/messages/${check.messageId}`, { "embeds": [embed] }).catch((e) => { return message.reply(`Unable to edit embed: ${e.message}`, false) })
    },
};
