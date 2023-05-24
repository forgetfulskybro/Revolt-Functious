const Giveaways = require("../models/giveaways");
const Embed = require("../functions/embed");
async function giveawaysEnd(client) {
    setInterval(async () => {
        let giveaways = await Giveaways.find({ ended: false });
        if (giveaways.length === 0) return;
        giveaways.map(async db => {
            let set = db.now;
            let timeout = db.time;
            let endDate = Date.now();
            if (set - (Date.now() - timeout) <= 60000) {
                setTimeout(async () => {
                    if (db.users.length === 0) {
                        const noUsers = new Embed()
                            .setColor("#A52F05")
                            .setTitle(`Giveaway`)
                            .setDescription(`No one entered into the giveaway so I couldn't pick a winner!\n\nEnded: <t:${Math.floor((endDate) / 1000)}:R>\nPrize: ${db.prize}\nWinner(s): None${db.requirement ? `\nRequirement: ${db.requirement}` : ``}`)

                        await db.updateOne({ ended: true, endDate: endDate })
                        await db.save();

                        await client.api.post(`/channels/${db.channelId}/messages`, { "content": `No one entered into giveaway **[${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})**!` }).catch(() => { console.warn(`[Channel Post] Unable to post to channel ${db.channelId}`) })
                        return await client.api.patch(`/channels/${db.channelId}/messages/${db.messageId}`, { "embeds": [noUsers] }).catch(() => { console.warn(`[Channel Edit] Unable to edit message ${db.messageId} in channel ${db.channelId}`) });
                    }

                    for (let i = 0; i < db.winners; i++) {
                        let winner = db.picking[Math.floor(Math.random() * db.picking.length)];
                        if (winner) {
                            const filtered = db.picking.filter(object => object.userID != winner.userID)
                            db.picking = filtered;
                            db.pickedWinners.push({ id: winner.userID })
                            await db.updateOne({ ended: true, endDate: endDate })
                            await db.save();
                        }
                    }

                    const embed = new Embed()
                        .setColor("#A52F05")
                        .setTitle(`Giveaway`)
                        .setDescription(`The giveaway has ended!\nParticipants: ${db.users.length}\n\nEnded: <t:${Math.floor((endDate) / 1000)}:R>\nPrize: ${db.prize}\nWinner(s): ${db.pickedWinners.map(w => `<@${w.id}>`).join(", ")}${db.requirement ? `\nRequirement: ${db.requirement}` : ``}`)

                    await client.api.post(`/channels/${db.channelId}/messages`, { "content": `Congratulations ${db.pickedWinners.map(w => `<@${w.id}>`).join(", ")}! You won the giveaway for **[${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})**!` }).catch(() => { console.warn(`[Channel Post] Unable to post to channel ${db.channelId}`) })
                    return await client.api.patch(`/channels/${db.channelId}/messages/${db.messageId}`, { "embeds": [embed] }).catch(() => { console.warn(`[Channel Edit] Unable to edit message ${db.messageId} in channel ${db.channelId}`) });
                }, set - (Date.now() - timeout));
            }
        });
    }, 60000);
}

module.exports = giveawaysEnd;