const Embed = require("../../functions/embed");
const checkPolls = require("../../functions/checkPolls");
const checkGiveaways = require("../../functions/checkGiveaways");
const Giveaways = require("../../models/giveaways");
const SavedPolls = require(`../../models/savedPolls`)
module.exports = async (client) => {
  console.log(`${client.user.username} is ready!`);
  await checkPolls(client);
  await checkGiveaways(client);

  setInterval(async () => {
    let giveaways = await Giveaways.find();
    giveaways.map(async db => {
      if (db.ended) return;
      let set = db.now;
      let timeout = db.time;
      let endDate = Date.now();
      if (set - (Date.now() - timeout) <= 0) {
        if (db.users.length === 0) {
          const noUsers = new Embed()
            .setColor("#A52F05")
            .setTitle(`Giveaway`)
            .setDescription(`No one entered into the giveaway so I couldn't pick a winner!\n\nEnded: <t:${Math.floor((endDate) / 1000)}:R>\nPrize: ${db.prize}\nWinner(s): None${db.requirement ? `\nRequirement: ${db.requirement}` : ``}`)

          await db.updateOne({ ended: true, endDate: endDate })
          await db.save();

          await client.api.post(`/channels/${db.channelId}/messages`, { "content": `No one entered into giveaway **[${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})**!`, replies: [{ id: db.messageId, mention: false }] }).catch(() => { console.warn(`[Channel Post] Unable to post to channel ${db.channelId}`) })
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

        await client.api.post(`/channels/${db.channelId}/messages`, { "content": `Congratulations ${db.pickedWinners.map(w => `<@${w.id}>`).join(", ")}! You won the giveaway for **[${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})**!`, replies: [{ id: db.messageId, mention: false }] }).catch(() => { console.warn(`[Channel Post] Unable to post to channel ${db.channelId}`) })
        return await client.api.patch(`/channels/${db.channelId}/messages/${db.messageId}`, { "embeds": [embed] }).catch(() => { console.warn(`[Channel Edit] Unable to edit message ${db.messageId} in channel ${db.channelId}`) });
      }
    });
  }, 3000)

  setInterval(async () => {
    const giveaways = await Giveaways.find()
    const polls = await SavedPolls.find()
    let statuses = [`${client.config.prefix}help | ${client.servers.size} servers`, `${client.config.prefix}help | ${giveaways.length} giveaways`, `${client.config.prefix}help | ${polls.length} polls`];
    let status = statuses[Math.floor(Math.random() * statuses.length)];
    client.users.edit({ status: { text: status, presence: "Focus" } })
  }, 300000);
} 