const Embed = require("../functions/embed");
const PollDB = require("../models/polls");
const Giveaways = require("../models/giveaways");
const emojis = [{ name: "1️⃣", id: 0 }, { name: "2️⃣", id: 1 }, { name: "3️⃣", id: 2 }, { name: "4️⃣", id: 3 }, { name: "5️⃣", id: 4 }, { name: "6️⃣", id: 5 }, { name: "7️⃣", id: 6 }, { name: "8️⃣", id: 7 }, { name: "9️⃣", id: 8 }, { name: "🔟", id: 9 }, { name: "🛑", id: "stop" }]

module.exports = async (client, message, userId, emojiId) => {
    const paginateCheck = client.paginate.get(userId);
    const pollCheck = client.polls.get(message.id);

    if (paginateCheck) {
        if (paginateCheck.message !== message.id) return;
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
        if (pollCheck.poll.options.description.length > 80) tooMuch.push(`**Title**: ${pollCheck.poll.options.description}`)
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
            message.edit({ content: `Owner (<@${pollCheck.owner}>) ended the poll early. These are the final results:`, embeds: [new Embed().setDescription(tooMuch.length > 0 ? tooMuch.map(e => e).join("\n") : null).setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#F24646")] }).catch(() => { });
            return client.polls.delete(message.id);
        } else if (convert === 0 && convert !== 10 || convert !== -1 && convert !== 10) {
            if (client.reactions.get(userId)) return client.users.get(userId).openDM().then(dm => dm.sendMessage(`You are reacting too fast! Please wait a few seconds before reacting again.`)).catch(() => { });
            if (pollCheck.users.includes(userId)) return;
            pollCheck.users.push(userId);
            let user = await client.users.get(userId);
            if (!user) user = await client.users.fetch(userId);
            await pollCheck.poll.addVote(convert, userId, user && user.avatar && user.avatar.id ? `https://autumn.revolt.chat/avatars/${user.avatar.id}` : `https://api.revolt.chat/users/${userId}/default_avatar`, message.id);
            message.edit({ embeds: [new Embed().setDescription(tooMuch.length > 0 ? tooMuch.map(e => e).join("\n") : null).setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#A52F05")] }).catch(() => { });
            client.reactions.set(userId, Date.now() + 3000)
            return setTimeout(() => client.reactions.delete(userId), 3000)
        } else return;
    } else {
        const db = await Giveaways.findOne({ messageId: message.id });
        if (emojiId === client.config.emojis.confetti && db && !db.ended) {
            if (client.reactions.get(userId)) return;
            if (db.users.find(u => u.userID === userId)) return;
            db.users.push({ userID: userId });
            db.picking.push({ userID: userId });
            db.save();

            client.reactions.set(userId, Date.now() + 3000)
            setTimeout(() => client.reactions.delete(userId), 3000)

            client.users.get(userId).openDM().then(dm => dm.sendMessage(`You joined giveaway [${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})!\nThere's currently **${db.users.length}** user(s) in this giveaway`)).catch(() => { });
        } else if (emojiId === client.config.emojis.stop && db && db.owner === userId && !db.ended) {
            let endDate = Date.now();

            if (db.users.length === 0) {
                const noUsers = new Embed()
                    .setColor("#A52F05")
                    .setTitle(`Giveaway`)
                    .setDescription(`Owner (<@${userId}>) ended the giveaway early\nNo one entered into the giveaway so I couldn't pick a winner!\n\nEnded: <t:${Math.floor((endDate) / 1000)}:R>\nPrize: ${db.prize}\nWinner(s): None${db.requirement ? `\nRequirement: ${db.requirement}` : ``}`)

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
                .setDescription(`Owner (<@${userId}>) ended the giveaway early\nParticipants: ${db.users.length}\n\nEnded: <t:${Math.floor((endDate) / 1000)}:R>\nPrize: ${db.prize}\nWinner(s): ${db.pickedWinners.length > 0 ? db.pickedWinners.map(w => `<@${w.id}>`).join(", ") : "None"}${db.requirement ? `\nRequirement: ${db.requirement}` : ``}`)

            message.edit({ embeds: [noUsers] }).catch(() => { });
            await client.api.post(`/channels/${db.channelId}/messages`, { "content": `Congratulations ${db.pickedWinners.map(w => `<@${w.id}>`).join(", ")}! You won the giveaway for **[${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})**!` }).catch(() => { });
            client.reactions.set(userId, Date.now() + 3000)
            setTimeout(() => client.reactions.delete(userId), 3000)
        }
    }
}