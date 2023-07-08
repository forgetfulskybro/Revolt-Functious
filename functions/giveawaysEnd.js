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
                            .setTitle(client.translate.get(db.lang, "Functions.giveawaysEnd.giveaway"))
                            .setDescription(`${client.translate.get(db.lang, "Functions.giveawaysEnd.noUsers")}!\n\n${client.translate.get(db.lang, "Functions.giveawaysEnd.ended")}: <t:${Math.floor((endDate) / 1000)}:R>\n${client.translate.get(db.lang, "Functions.giveawaysEnd.prize")}: ${db.prize}\n${client.translate.get(db.lang, "Functions.giveawaysEnd.winnersNone")}${db.requirement ? `\n${client.translate.get(db.lang, "Functions.giveawaysEnd.reqs")}: ${db.requirement}` : ``}`)

                        await db.updateOne({ ended: true, endDate: endDate })
                        await db.save();

                        await client.api.post(`/channels/${db.channelId}/messages`, { "content": `${client.translate.get(db.lang, "Functions.giveawaysEnd.noOne")} **[${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})**!` }).catch(() => { console.warn(`${client.translate.get(db.lang, "Functions.giveawaysEnd.warn2")} ${db.channelId}`) })
                        return await client.api.patch(`/channels/${db.channelId}/messages/${db.messageId}`, { "embeds": [noUsers] }).catch(() => { console.warn(`${client.translate.get(db.lang, "Functions.giveawaysEnd.warn")} ${db.messageId} ${client.translate.get(db.lang, "Functions.giveawaysEnd.warn1")} ${db.channelId}`) });
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
                        .setTitle(client.translate.get(db.lang, "Functions.giveawaysEnd.giveaway"))
                        .setDescription(`${client.translate.get(db.lang, "Functions.giveawaysEnd.givEnd")}!\n${client.translate.get(db.lang, "Functions.giveawaysEnd.partici")}: ${db.users.length}\n\n${client.translate.get(db.lang, "Functions.giveawaysEnd.ended")}: <t:${Math.floor((endDate) / 1000)}:R>\n${client.translate.get(db.lang, "Functions.giveawaysEnd.prize")}: ${db.prize}\n${client.translate.get(db.lang, "Functions.giveawaysEnd.winners")}: ${db.pickedWinners.map(w => `<@${w.id}>`).join(", ")}${db.requirement ? `\n${client.translate.get(db.lang, "Functions.giveawaysEnd.reqs")} ${db.requirement}` : ``}`)

                    await client.api.post(`/channels/${db.channelId}/messages`, { "content": `${client.translate.get(db.lang, "Functions.giveawaysEnd.congrats")} ${db.pickedWinners.map(w => `<@${w.id}>`).join(", ")}! ${client.translate.get(db.lang, "Functions.giveawaysEnd.youWon")} **[${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})**!` }).catch(() => { console.warn(`${client.translate.get(db.lang, "Functions.giveawaysEnd.warn2")} ${db.channelId}`) })
                    return await client.api.patch(`/channels/${db.channelId}/messages/${db.messageId}`, { "embeds": [embed] }).catch(() => { console.warn(`${client.translate.get(db.lang, "Functions.giveawaysEnd.warn")} ${db.messageId} ${client.translate.get(db.lang, "Functions.giveawaysEnd.warn1")} ${db.channelId}`) });
                }, set - (Date.now() - timeout));
            }
        });
    }, 60000);
}

module.exports = giveawaysEnd;