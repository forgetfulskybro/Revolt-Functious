const Embed = require("../functions/embed");
const Giveaways = require("../models/giveaways");
const emojis = [{ name: "1️⃣", id: 0 }, { name: "2️⃣", id: 1 }, { name: "3️⃣", id: 2 }, { name: "4️⃣", id: 3 }, { name: "5️⃣", id: 4 }, { name: "6️⃣", id: 5 }, { name: "7️⃣", id: 6 }, { name: "8️⃣", id: 7 }, { name: "9️⃣", id: 8 }, { name: "🔟", id: 9 }, { name: "🛑", id: "stop" }]
const colors = /^([A-Z0-9]+)/;

module.exports = async (client, message, userId, emojiId) => {
    const pollCheck = client.polls.get(message.id);
    const collector = client.messageCollector.get(userId);

    if (collector && collector.messageId === message.id && collector.channelId === message.channelId) {
        const emoji = collector.rolesDone.find(e => e.emoji === emojiId);
        if (emoji) {
            collector.rolesDone = collector.rolesDone.filter(object => object.emoji != emojiId);
            collector.roles.push([emoji.role, { name: emoji.name, colour: emoji.color }]);
            collector.regex.push(emoji.name);

            if (colors.test(emojiId)) emote = `:${emojiId}:`;
            else if (!colors.test(emojiId)) emote = emojiId
            return message.edit(collector.type === "content" ? { content: message.content.replace(`${emote} $\\text{\\textcolor{${emoji.color}}{${emoji.name}}}$`, `{role:${emoji.name}}`) } : { embeds: [new Embed().setColor("#A52F05").setDescription(client.messages.get(message.id).embeds[0].description.replace(`{role:${collector.regex[0]}}`, `:${emojiId}: $\\text{\\textcolor{${collector.roles[0][1].colour?.includes("linear-gradient") ? '#000000' : collector.roles[0][1].colour}}{${collector.roles[0][1].name}}}$`))] }).catch(() => { });
        }
    } else if (pollCheck) {
        if (client.reactions.get(userId)) return client.users.get(userId)?.openDM().then(dm => dm.sendMessage(client.translate.get(pollCheck.language, "Events.messageReactionRemove.tooFast"))).catch(() => { });
        let convert = emojis.findIndex(e => e.name === emojiId);
        if (convert === 0 && convert !== 10 || convert !== -1 && convert !== 10) {
            if (!pollCheck.users.includes(userId)) return;

            let tooMuch = [];
            if (pollCheck.poll.options.description.length > 80) tooMuch.push(`**${client.translate.get(pollCheck.language, "Events.messageReactionRemove.title")}**: ${pollCheck.poll.options.description}`)
            pollCheck.poll.voteOptions.name.filter(e => e).forEach((e, i) => {
                i++
                if (e.length > 70) {
                    tooMuch.push(`**${i}.** ${e}`)
                }
            });

            pollCheck.users = pollCheck.users.filter(object => object != userId);
            const user = (client.users.get(userId)) || await client.users.fetch(userId);
            await pollCheck.poll.removeVote(convert, userId, user && user.avatar && user.avatar.id ? `https://autumn.revolt.chat/avatars/${user.avatar.id}` : `https://api.revolt.chat/users/${userId}/default_avatar`, message.id);
            message.edit({ embeds: [new Embed().setDescription(tooMuch.length > 0 ? tooMuch.map(e => e).join("\n") : null).setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#A52F05")] }).catch(() => { });
            client.reactions.set(userId, Date.now() + 3000)
            return setTimeout(() => client.reactions.delete(userId), 3000)
        } else return;
    } else {
        if (client.reactions.get(userId)) return;
        const db = await Giveaways.findOne({ messageId: message.id });
        if (db && !db.ended) {
            if (emojiId === client.config.emojis.confetti) {
                if (!db.users.find(u => u.userID === userId)) return;
                const filtered = db.users.filter(object => object.userID != userId)
                db.users = filtered;
                const filtered2 = db.picking.filter(object => object.userID != userId)
                db.picking = filtered2;
                db.save();

                client.reactions.set(userId, Date.now() + 3000)
                setTimeout(() => client.reactions.delete(userId), 3000)

                client.users.get(userId)?.openDM().then(dm => dm.sendMessage(`${client.translate.get(pollCheck.language, "Events.messageReactionRemove.left")} [${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})!\n${client.translate.get(pollCheck.language, "Events.messageReactionRemove.left2")} **${db.users.length}** ${client.translate.get(pollCheck.language, "Events.messageReactionRemove.left")}!`)).catch(() => { });
            }
        } else {
            const db2 = await client.database.getGuild(message.server.id, true)
            if (db2 && db2.roles.find(e => e.msgId === message.id) && db2.roles.find(e => e.roles.find(e => e.emoji === emojiId))) {
                const roles = [];
                db2.roles.find(e => e.msgId === message.id).roles.map(e => roles.push(e));
                const role = roles.find(e => e.emoji === emojiId);
                const member = await (client.servers.get(message.server.id) || await client.servers.fetch(message.server.id))?.fetchMember(userId);
                if (!member) return;

                let error = false;
                let dataRoles = [];
                if (member.roles) member.roles.map(e => dataRoles.push(e));
                if (!dataRoles.includes(role.role)) return;

                client.reactions.set(userId, Date.now() + 3000);
                setTimeout(() => client.reactions.delete(userId), 3000);

                dataRoles = dataRoles.filter(object => object != role.role);
                await member.edit({ roles: dataRoles }).catch(() => { error = true })

                if (error) {
                    if (db2.dm) member?.user?.openDM().then((dm) => { dm.sendMessage(`${client.translate.get(db2.language, "Events.messageReactionRemove.noPerms").replace("{role}", `**${role.name}**`)}!`) }).catch(() => { });
                } else {
                    if (db2.dm) member?.user?.openDM().then((dm) => { dm.sendMessage(`${client.translate.get(db2.language, "Events.messageReactionRemove.success").replace("{role}", `**${role.name}**`)}!`) }).catch(() => { });
                }
            }
        }
    }
}