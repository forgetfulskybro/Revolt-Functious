const Embed = require("../functions/embed");
const PollDB = require("../models/polls");
const Giveaways = require("../models/giveaways");
const emojis = [{ name: "1️⃣", id: 0 }, { name: "2️⃣", id: 1 }, { name: "3️⃣", id: 2 }, { name: "4️⃣", id: 3 }, { name: "5️⃣", id: 4 }, { name: "6️⃣", id: 5 }, { name: "7️⃣", id: 6 }, { name: "8️⃣", id: 7 }, { name: "9️⃣", id: 8 }, { name: "🔟", id: 9 }, { name: "🛑", id: "stop" }]
const colors = /^([A-Z0-9]+)/;

module.exports = async (client, message, userId, emojiId) => {
    const paginateCheck = client.paginate.get(userId);
    const pollCheck = client.polls.get(message.id);
    const collector = client.messageCollector.get(userId);

    if (collector && collector.messageId === message.id || collector?.oldMessageId && collector?.oldMessageId === message.id && collector.channelId === message.channelId) {
        if (emojiId === client.config.emojis.check) {
            if (collector.roles.length === 0) {
                const db = await client.database.getGuild(message.server.id);
                message.delete().catch(() => { });
                const reactions = [...collector.rolesDone.map(e => e.emoji)];
                message.channel.sendMessage(collector.type === "content" ? { content: `${message.content}\n\n##### ${client.translate.get(db.language, "Events.messageReactionAdd.cooldown")}`, interactions: [reactions] } : { embeds: [new Embed().setColor("#A52F05").setDescription(`${client.messages.get(message.id).embeds[0].description}\n\n##### ${client.translate.get(db.language, "Events.messageReactionAdd.cooldown")}`)], interactions: [reactions] }).then(async (msg) => {
                    db.roles.push({ msgId: msg.id, chanId: msg.channelId, roles: [...collector.rolesDone] });
                    await client.database.updateGuild(msg.server.id, { roles: db.roles });
                });

                clearTimeout(client.messageCollector.get(userId).timeout);
                return client.messageCollector.delete(userId);
            } else return;
        } else if (emojiId === client.config.emojis.cross) {
            const db = await client.database.getGuild(message.server.id);
            client.messageCollector.delete(userId);
            return message.reply({ embeds: [new Embed().setColor("#A52F05").setDescription(client.translate.get(db.language, "Events.messageReactionAdd.deleteCollector"))] }, );
        } else {
            if (collector.roles.length === 0) return;
            let emote;
            if (colors.test(emojiId)) emote = `:${emojiId}:`;
            else if (!colors.test(emojiId)) emote = emojiId
            collector.rolesDone.push({ emoji: emojiId, role: collector.roles[0][0], name: collector.roles[0][1].name, color: collector.roles[0][1].colour?.includes("linear-gradient") ? '#000000' : collector.roles[0][1].colour });
            message.edit(collector.type === "content" ? { content: message.content.replace(`{role:${collector.regex[0]}}`, `${emote} $\\text{\\textcolor{${collector.roles[0][1].colour?.includes("linear-gradient") ? '#000000' : collector.roles[0][1].colour}}{${collector.roles[0][1].name}}}$`) } : { embeds: [new Embed().setColor("#A52F05").setDescription(client.messages.get(message.id).embeds[0].description.replace(`{role:${collector.regex[0]}}`, `:${emojiId}: $\\text{\\textcolor{${collector.roles[0][1].colour?.includes("linear-gradient") ? '#000000' : collector.roles[0][1].colour}}{${collector.roles[0][1].name}}}$`))] })
            collector.roles.shift();
            return collector.regex.shift();
        }
    } else if (paginateCheck && paginateCheck.message == message.id) {
        let pages = paginateCheck.pages;
        let page = paginateCheck.page;
        switch (emojiId) {
            case "⏪":
                if (page !== 0) {
                    message.edit({
                        embeds: [pages[0]]
                    }).catch(() => { });
                    return paginateCheck.page = 0
                } else {
                    return;
                }
            case "⬅️":
                if (pages[page - 1]) {
                    message.edit({
                        embeds: [pages[--page]]
                    }).catch(() => { });
                    return paginateCheck.page = paginateCheck.page - 1
                } else {
                    return;
                }
            case "➡️":
                if (pages[page + 1]) {
                    message.edit({
                        embeds: [pages[++page]]
                    }).catch(() => { });
                    return paginateCheck.page = paginateCheck.page + 1
                } else {
                    return;
                }
            case "⏩":
                if (page !== pages.length) {
                    message.edit({
                        embeds: [pages[pages.length - 1]]
                    }).catch(() => { });
                    return paginateCheck.page = pages.length - 1
                } else {
                    return;
                }
        }
    } else if (pollCheck) {
        let tooMuch = [];
        if (pollCheck.poll.options.description.length > 80) tooMuch.push(`**${client.translate.get(pollCheck.lang, "Events.messageReactionAdd.title")}**: ${pollCheck.poll.options.description}`)
        pollCheck.poll.voteOptions.name.filter(e => e).forEach((e, i) => {
            i++
            if (e.length > 70) {
                tooMuch.push(`**${i}.** ${e}`)
            }
        });

        let convert = emojis.findIndex(e => e.name === emojiId);
        if (convert === 10 && pollCheck.owner === userId) {
            await PollDB.findOneAndDelete({ messageId: message.id });
            await pollCheck.poll.update();
            message.edit({ content: `${client.translate.get(pollCheck.lang, "Events.messageReactionAdd.owner")} (<@${pollCheck.owner}>) ${client.translate.get(pollCheck.lang, "Events.messageReactionAdd.end")}:`, embeds: [new Embed().setDescription(tooMuch.length > 0 ? tooMuch.map(e => e).join("\n") : null).setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#F24646")] }).catch(() => { });
            return client.polls.delete(message.id);
        } else if (convert === 0 && convert !== 10 || convert !== -1 && convert !== 10) {
            if (client.reactions.get(userId)) return client.users.get(userId)?.openDM().then(dm => dm.sendMessage(client.translate.get(pollCheck.lang, "Events.messageReactionAdd.tooFast"))).catch(() => { });
            if (pollCheck.users.includes(userId)) return;
            pollCheck.users.push(userId);
            const user = (client.users.get(userId)) || await client.users.fetch(userId);
            await pollCheck.poll.addVote(convert, userId, user && user.avatar && user.avatar.id ? `https://autumn.revolt.chat/avatars/${user.avatar.id}` : `https://api.revolt.chat/users/${userId}/default_avatar`, message.id);
            message.edit({ embeds: [new Embed().setDescription(tooMuch.length > 0 ? tooMuch.map(e => e).join("\n") : null).setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#A52F05")] }).catch(() => { });
            client.reactions.set(userId, Date.now() + 3000)
            return setTimeout(() => client.reactions.delete(userId), 3000)
        } else return;
    } else {
        const db = await Giveaways.findOne({ messageId: message.id });
        if (db) {
            if (emojiId === client.config.emojis.confetti && db && !db.ended) {
                if (client.reactions.get(userId)) return;
                if (db.users.find(u => u.userID === userId)) return;
                db.users.push({ userID: userId });
                db.picking.push({ userID: userId });
                db.save();

                client.reactions.set(userId, Date.now() + 3000)
                setTimeout(() => client.reactions.delete(userId), 3000)

                client.users.get(userId)?.openDM().then(dm => dm.sendMessage(`${client.translate.get(db.lang, "Events.messageReactionAdd.joined")} [${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})!\n${client.translate.get(db.lang, "Events.messageReactionAdd.joined2")} **${db.users.length}** ${client.translate.get(db.lang, "Events.messageReactionAdd.joined3")}`)).catch(() => { });
            } else if (emojiId === client.config.emojis.stop && db && db.owner === userId && !db.ended) {
                let endDate = Date.now();

                if (db.users.length === 0) {
                    const noUsers = new Embed()
                        .setColor("#A52F05")
                        .setTitle(client.translate.get(db.lang, "Events.messageReactionAdd.giveaway"))
                        .setDescription(`${client.translate.get(db.lang, "Events.messageReactionAdd.owner")} (<@${userId}>) ${client.translate.get(db.lang, "Events.messageReactionAdd.early")}\n${client.translate.get(db.lang, "Events.messageReactionAdd.endNone")}!\n\n${client.translate.get(db.lang, "Events.messageReactionAdd.ended")}: <t:${Math.floor((endDate) / 1000)}:R>\n${client.translate.get(db.lang, "Events.messageReactionAdd.prize")}: ${db.prize}\n${client.translate.get(db.lang, "Events.messageReactionAdd.winnersNone")}${db.requirement ? `\n${client.translate.get(db.lang, "Events.messageReactionAdd.reqs")}: ${db.requirement}` : ``}`)

                    await db.updateOne({ ended: true, endDate: endDate })
                    await db.save();
                    return await client.api.patch(`/channels/${db.channelId}/messages/${db.messageId}`, { "embeds": [noUsers] });
                }

                for (let i = 0; i < db.winners; i++) {
                    let winner = db.picking[Math.floor(Math.random() * db.picking.length)];
                    if (winner) {
                        const filtered = db.picking.filter(object => object.userID != winner.userID)
                        db.picking = filtered;
                        db.pickedWinners.push({ id: winner.userID })
                    }
                }

                await db.updateOne({ ended: true, endDate: endDate })
                await db.save();

                const noUsers = new Embed()
                    .setColor("#A52F05")
                    .setTitle(client.translate.get(db.lang, "Events.messageReactionAdd.giveaway"))
                    .setDescription(`${client.translate.get(db.lang, "Events.messageReactionAdd.owner")} (<@${userId}>) ${client.translate.get(db.lang, "Events.messageReactionAdd.early")}\n${client.translate.get(db.lang, "Events.messageReactionAdd.partici")}: ${db.users.length}\n\n${client.translate.get(db.lang, "Events.messageReactionAdd.ended")}: <t:${Math.floor((endDate) / 1000)}:R>\n${client.translate.get(db.lang, "Events.messageReactionAdd.prize")}: ${db.prize}\n${client.translate.get(db.lang, "Events.messageReactionAdd.winners")}: ${db.pickedWinners.length > 0 ? db.pickedWinners.map(w => `<@${w.id}>`).join(", ") : client.translate.get(db.lang, "Events.messageReactionAdd.none")}${db.requirement ? `\n${client.translate.get(db.lang, "Events.messageReactionAdd.reqs")}: ${db.requirement}` : ``}`)

                message.edit({ embeds: [noUsers] }).catch(() => { });
                await client.api.post(`/channels/${db.channelId}/messages`, { "content": `${client.translate.get(db.lang, "Events.messageReactionAdd.congrats")} ${db.pickedWinners.map(w => `<@${w.id}>`).join(", ")}! ${client.translate.get(db.lang, "Events.messageReactionAdd.youWon")} **[${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})**!` }).catch(() => { });
                client.reactions.set(userId, Date.now() + 3000)
                setTimeout(() => client.reactions.delete(userId), 3000)
            }
        } else {
            const db2 = await client.database.getGuild(message.server.id, true)
            if (db2 && db2.roles.find(e => e.msgId === message.id) && db2.roles.find(e => e.roles.find(e => e.emoji === emojiId))) {
                if (client.reactions.get(userId)) return;

                const roles = [];
                db2.roles.find(e => e.msgId === message.id).roles.map(e => roles.push(e));
                const role = roles.find(e => e.emoji === emojiId);
                const member = await (client.servers.get(message.server.id) || await client.servers.fetch(message.server.id))?.fetchMember(userId);
                if (!member) return;

                let error = false;
                let dataRoles = [];
                if (member.roles) member.roles.map(e => dataRoles.push(e));
                if (dataRoles.includes(role.role)) return;

                client.reactions.set(userId, Date.now() + 3000);
                setTimeout(() => client.reactions.delete(userId), 3000);

                dataRoles.push(role.role);
                await member.edit({ roles: dataRoles }).catch(() => { error = true })

                if (error && db2.dm) {
                    member?.user?.openDM().then((dm) => { dm.sendMessage(`${client.translate.get(db2.language, "Events.messageReactionAdd.noPerms").replace("{role}", `**${role.name}**`)}!`) }).catch(() => { });
                } else if (db2.dm) {
                    member?.user?.openDM().then((dm) => { dm.sendMessage(`${client.translate.get(db2.language, "Events.messageReactionAdd.success").replace("{role}", `**${role.name}**`)}!`) }).catch(() => { });
                }
            }
        }
    }
}