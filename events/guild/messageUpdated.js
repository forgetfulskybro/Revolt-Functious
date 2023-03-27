const Embed = require("../../functions/embed");
const PollDB = require("../../models/polls");
const Giveaways = require("../../models/giveaways");

function convertEmojiNum(emoji) {
    if (emoji === "1️⃣") return 0;
    else if (emoji === "2️⃣") return 1;
    else if (emoji === "3️⃣") return 2;
    else if (emoji === "4️⃣") return 3;
    else if (emoji === "5️⃣") return 4;
    else if (emoji === "6️⃣") return 5;
    else if (emoji === "7️⃣") return 6;
    else if (emoji === "8️⃣") return 7;
    else if (emoji === "9️⃣") return 8;
    else if (emoji === "🔟") return 9;
    else if (emoji === "🛑") return "stop";
    else return null;
}

module.exports = async (client, message, newMsg) => {
    if (newMsg.data && newMsg.data.content && newMsg.type === "MessageUpdate") {
        const testCmd = client.commands.get(newMsg.data.content.slice(client.config.prefix.length)) || client.aliases.get(newMsg.data.content.slice(client.config.prefix.length));
        if (!testCmd || testCmd && testCmd.config.name === "ping") return;
        client.emit("message", message)
    } else if (newMsg.type === "MessageReact") {
        const paginateCheck = client.paginate.get(newMsg.user_id);
        const pollCheck = client.polls.get(message._id);

        if (paginateCheck) {
            if (paginateCheck.message !== message._id) return;
            let pages = paginateCheck.pages;
            let page = paginateCheck.page;
            switch (newMsg.emoji_id) {
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
            let convert = convertEmojiNum(newMsg.emoji_id);
            if (convert === "stop" && pollCheck.owner === newMsg.user_id) {
                await PollDB.findOneAndDelete({ messageId: message._id });
                await pollCheck.poll.update();
                message.edit({ content: `Owner (<@${pollCheck.owner}>) ended the poll early. These are the final results:`, embeds: [new Embed().setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#F24646")] }).catch(() => { });
                client.polls.delete(message._id);
            } else if (convert) {
                if (pollCheck.users.includes(newMsg.user_id)) return;
                pollCheck.users.push(newMsg.user_id);
                let user = await client.users.get(newMsg.user_id);
                if (!user) user = await client.api.get(`/users/${newMsg.user_id}`).then(res => client.users.createObj(res, true)).catch(() => { });
                await pollCheck.poll.addVote(convert, newMsg.user_id, user && user.avatar && user.avatar._id ? `https://autumn.revolt.chat/avatars/${user.avatar._id}` : `https://api.revolt.chat/users/${newMsg.user_id}/default_avatar`, message._id);
                message.edit({ embeds: [new Embed().setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#A52F05")] }).catch(() => { });
            } else return;
        } else {
            const db = await Giveaways.findOne({ messageId: message._id });
            if (newMsg.emoji_id === client.config.emojis.confetti && db && !db.ended) {
                if (client.reactions.get(newMsg.user_id)) return;
                if (db.users.find(u => u.userID === newMsg.user_id)) return;
                db.users.push({ userID: newMsg.user_id });
                db.picking.push({ userID: newMsg.user_id });
                db.save();

                client.reactions.set(newMsg.user_id, Date.now() + 3000)
                setTimeout(() => client.reactions.delete(newMsg.user_id), 3000)

                client.users.get(newMsg.user_id).openDM().then(dm => dm.sendMessage(`You joined giveaway [${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})!\nThere's currently **${db.users.length}** user(s) in this giveaway`)).catch(() => { });
            } else if (newMsg.emoji_id === client.config.emojis.stop && db && db.owner === newMsg.user_id && !db.ended) {
                let endDate = Date.now();

                if (db.users.length === 0) {
                    const noUsers = new Embed()
                        .setColor("#A52F05")
                        .setTitle(`Giveaway`)
                        .setDescription(`Owner (<@${newMsg.user_id}>) ended the giveaway early\nNo one entered into the giveaway so I couldn't pick a winner!\n\nEnded: <t:${Math.floor((endDate) / 1000)}:R>\nPrize: ${db.prize}\nWinner(s): None${db.requirement ? `\nRequirement: ${db.requirement}` : ``}`)

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
                    .setTitle(`Giveaway`)
                    .setDescription(`Owner (<@${newMsg.user_id}>) ended the giveaway early\nParticipants: ${db.users.length}\n\nEnded: <t:${Math.floor((endDate) / 1000)}:R>\nPrize: ${db.prize}\nWinner(s): ${db.pickedWinners.length > 0 ? db.pickedWinners.map(w => `<@${w.id}>`).join(", ") : "None"}${db.requirement ? `\nRequirement: ${db.requirement}` : ``}`)

                message.edit({ embeds: [noUsers] }).catch(() => { });
                await client.api.post(`/channels/${db.channelId}/messages`, { "content": `Congratulations ${db.pickedWinners.map(w => `<@${w.id}>`).join(", ")}! You won the giveaway for **[${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})**!`, replies: [{ id: db.messageId, mention: false }] }).catch(() => { });
                client.reactions.set(newMsg.user_id, Date.now() + 3000)
                setTimeout(() => client.reactions.delete(newMsg.user_id), 3000)
            }
        }
    } else if (newMsg.type === "MessageUnreact") {
        if (client.reactions.get(newMsg.user_id)) return;
        const db = await Giveaways.findOne({ messageId: message._id });
        if (!db) return;
        if (db.ended) return;
        if (newMsg.emoji_id === client.config.emojis.confetti) {
            if (!db.users.find(u => u.userID === newMsg.user_id)) return;
            const filtered = db.users.filter(object => object.userID != newMsg.user_id)
            db.users = filtered;
            const filtered2 = db.picking.filter(object => object.userID != newMsg.user_id)
            db.picking = filtered2;
            db.save();

            client.reactions.set(newMsg.user_id, Date.now() + 3000)
            setTimeout(() => client.reactions.delete(newMsg.user_id), 3000)

            client.users.get(newMsg.user_id).openDM().then(dm => dm.sendMessage(`You left giveaway [${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})!\nThere's now **${db.users.length}** user(s) left in this giveaway`)).catch(() => { });
        }
    }
} 