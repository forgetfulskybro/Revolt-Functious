const Embed = require("../functions/embed");
async function Collector(client, message, db) {
    const regex = /{role:(.*?)}/;
    const regexAll = /{role:(.*?)}/g;
    const collector = client.messageCollector.get(message.authorId);
    if (!message.content.match(regexAll) || message.content.match(regexAll)?.length === 0) {
        message.reply({ embeds: [new Embed().setColor("#FF0000").setDescription(`${client.translate.get(db.language, "Events.messageCreate.noRoles")}: \`{role:Red}\``)] }, false).catch(() => { return });
        return message.react(client.config.emojis.cross).catch(() => { return });
    }

    const roles = message.content.match(regexAll).map((r) => r?.match(regex)[1]);
    if (roles.length > 20) {
        message.reply({ embeds: [new Embed().setColor("#FF0000").setDescription(client.translate.get(db.language, "Events.messageCreate.maxRoles"))] }, false).catch(() => { return });
        return message.react(client.config.emojis.cross).catch(() => { return });
    }
    collector.regex = roles
    const roleIds = []
    let newRoles = roles.map((r) => {
        return [...message.server.roles].map((r) => r).find((role) => r.toLowerCase() === role[1]?.name?.toLowerCase());
    })
    newRoles.map((r) => roleIds.push(r));

    if (roleIds.map((r) => !r).includes(true)) {
        let unknown = [];
        roleIds.map((r, i) => {
            i++
            if (!r) {
                unknown.push(roles[i - 1]);
            }
        });

        message.reply({ embeds: [new Embed().setColor("#FF0000").setDescription(`${client.translate.get(db.language, "Events.messageCreate.unknown")}\n${unknown.map(e => `\`{role:${e}}\``).join(", ")}`)] }, false).catch(() => { return });
        return message.react(client.config.emojis.cross).catch(() => { return });
    }

    let duplicate = [];
    roleIds.map((r, i) => {
        i++
        if (roleIds.filter(e => e[0] === r[0]).length > 1) duplicate.push(roleIds[i - 1]);
    });

    if (duplicate.length > 0) {
        message.reply({ embeds: [new Embed().setColor("#FF0000").setDescription(`${client.translate.get(db.language, "Events.messageCreate.duplicate")}\n${duplicate.map(e => `\`{role:${e[1].name}}\``)}`)] }, false).catch(() => { return });
        return message.react(client.config.emojis.cross).catch(() => { return });
    }

    let positions = [];
    const botRole = message.channel.server.member.orderedRoles.reverse()[0]
    if (!botRole) {
        message.reply({ embeds: [new Embed().setColor("#FF0000").setDescription(client.translate.get(db.language, "Events.messageCreate.noBotRole"))] }, false).catch(() => { return });
        return message.react(client.config.emojis.cross).catch(() => { return });
    }

    roleIds.map((r, i) => {
        i++
        if (r[1].rank <= botRole.rank) positions.push(roleIds[i - 1])
    });

    if (positions.length > 0) {
        message.reply({ embeds: [new Embed().setColor("#FF0000").setDescription(`${client.translate.get(db.language, "Events.messageCreate.positions")}\n${positions.map(e => `\`{role:${e[1].name}}\``)}`)] }, false).catch(() => { return });
        return message.react(client.config.emojis.cross).catch(() => { return });
    }

    message.delete().catch(() => { });
    collector.roles = roleIds;
    const react = [client.config.emojis.check];
    return message.channel.sendMessage(collector.type === "content" ? { content: message.content, interactions: [react] } : { embeds: [new Embed().setDescription(message.content).setColor("#A52F05")], interactions: [react] }).then((msg) => {
        collector.messageId = msg.id;
    });
}

module.exports = Collector;