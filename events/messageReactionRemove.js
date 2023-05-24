const Embed = require("../functions/embed");
const Giveaways = require("../models/giveaways");
const emojis = [{ name: "1️⃣", id: 0 }, { name: "2️⃣", id: 1 }, { name: "3️⃣", id: 2 }, { name: "4️⃣", id: 3 }, { name: "5️⃣", id: 4 }, { name: "6️⃣", id: 5 }, { name: "7️⃣", id: 6 }, { name: "8️⃣", id: 7 }, { name: "9️⃣", id: 8 }, { name: "🔟", id: 9 }, { name: "🛑", id: "stop" }]

module.exports = async (client, message, userId, emojiId) => {
    const pollCheck = client.polls.get(message.id);
    if (pollCheck) {
        if (client.reactions.get(userId)) return client.users.get(userId).openDM().then(dm => dm.sendMessage(`You are reacting too fast! Please wait a few seconds before reacting again.`)).catch(() => { });
        let convert = emojis.findIndex(e => e.name === emojiId);
        if (convert === 0 && convert !== 10 || convert !== -1 && convert !== 10) {
            if (!pollCheck.users.includes(userId)) return;

            let tooMuch = [];
            if (pollCheck.poll.options.description.length > 80) tooMuch.push(`**Title**: ${pollCheck.poll.options.description}`)
            pollCheck.poll.voteOptions.name.filter(e => e).forEach((e, i) => {
                i++
                if (e.length > 70) {
                    tooMuch.push(`**${i}.** ${e}`)
                }
            });

            pollCheck.users = pollCheck.users.filter(object => object != userId);
            let user = await client.users.get(userId);
            if (!user) user = await client.users.fetch(userId);
            await pollCheck.poll.removeVote(convert, userId, user && user.avatar && user.avatar.id ? `https://autumn.revolt.chat/avatars/${user.avatar.id}` : `https://api.revolt.chat/users/${userId}/default_avatar`, message.id);
            message.edit({ embeds: [new Embed().setDescription(tooMuch.length > 0 ? tooMuch.map(e => e).join("\n") : null).setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#A52F05")] }).catch(() => { });
            client.reactions.set(userId, Date.now() + 3000)
            return setTimeout(() => client.reactions.delete(userId), 3000)
        } else return;
    } else {
        if (client.reactions.get(userId)) return;
        const db = await Giveaways.findOne({ messageId: message.id });
        if (!db) return;
        if (db.ended) return;
        if (emojiId === client.config.emojis.confetti) {
            if (!db.users.find(u => u.userID === userId)) return;
            const filtered = db.users.filter(object => object.userID != userId)
            db.users = filtered;
            const filtered2 = db.picking.filter(object => object.userID != userId)
            db.picking = filtered2;
            db.save();

            client.reactions.set(userId, Date.now() + 3000)
            setTimeout(() => client.reactions.delete(userId), 3000)

            client.users.get(userId).openDM().then(dm => dm.sendMessage(`You left giveaway [${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})!\nThere's now **${db.users.length}** user(s) left in this giveaway`)).catch(() => { });
        }
    }
}