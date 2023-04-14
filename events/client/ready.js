
module.exports = async (client) => {
  setInterval(async () => {
    const giveaways = await Giveaways.find()
    const polls = await SavedPolls.find()
    let statuses = [`${client.config.prefix}help | ${client.servers.size} servers`, `${client.config.prefix}help | ${giveaways.length} giveaways`, `${client.config.prefix}help | ${polls.length} polls`];
    let status = statuses[Math.floor(Math.random() * statuses.length)];
    client.users.edit({ status: { text: status, presence: "Focus" } })
  }, 300000);
} 