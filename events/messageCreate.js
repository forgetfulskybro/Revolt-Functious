const Embed = require("../functions/embed");
const Collector = require("../functions/messageCollector");
module.exports = async (client, message) => {
    if (!message || message.channel.type === "DirectMessage" || !message.content || message.author.bot) return;

    const db = await client.database.getGuild(message.server.id, true)
    let args = message.content.slice(db.prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();

    if (message.content && (new RegExp(`^(<@!?${client.user.id}>)`)).test(message.content)) {
        const mention = new Embed()
        .setColor("#A52F05")
        .setTitle(client.user.username)
            .setDescription(`${client.translate.get(db.language, "Events.messageCreate.prefix")} \`${db.prefix}\`\n${client.translate.get(db.language, "Events.messageCreate.prefix2")} \`${db.prefix}help\``)

        return message.reply({
            embeds: [mention]
        }, false).catch(() => { return });
    }

    if (client.messageCollector.has(message.authorId) && client.messageCollector.get(message.authorId).channelId === message.channelId && !client.messageCollector.get(message.authorId).messageId) return await Collector(client, message, db);
    let commandfile = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    if (commandfile) {
        if (!message.content.startsWith(db.prefix)) return;
        if (!message.channel.havePermission("SendMessage")) return message.member.user.openDM().then((dm) => { dm.sendMessage(`${client.translate.get(db.language, "Events.messageCreate.unable")} <#${message.channelId}>. ${client.translate.get(db.language, "Events.messageCreate.contact")}.`) }).catch(() => { return });
        if (!message.channel.havePermission("React")) return message.reply(`${client.translate.get(db.language, "Events.messageCreate.noPerms")}. ${client.translate.get(db.language, "Events.messageCreate.contact")}.`, false).catch(() => { return });

        if (!commandfile.config.available && commandfile.config.available !== "Owner" && !client.config.owners.includes(message.authorId)) return message.reply({ embeds: [new Embed().setColor("#FF0000").setDescription(client.translate.get(db.languagem, "Events.messageCreate.unavail"))] }, false).catch(() => { return });
        if (commandfile.config.permissions.length > 0 && !message.member.hasPermission(message.server, commandfile.config.permissions[0]) && !client.config.owners.includes(message.authorId)) return message.reply({ embeds: [new Embed().setColor("#FF0000").setDescription(`${client.translate.get(db.language, "Events.messageCreate.perms")}.\n${client.translate.get(db.language, "Events.messageCreate.perms2")}: [${commandfile.config.permissions[0]}]`)] }, false).catch(() => { return });

        const used = client.used.get(`${message.authorId}-${cmd.toLowerCase()}`);
        if (used) {
            if (client.timeout.get(`${message.authorId}-${cmd.toLowerCase()}`)) return;

            client.timeout.set(`${message.authorId}-${cmd.toLowerCase()}`, used);
            setTimeout(() => client.timeout.delete(`${message.authorId}-${cmd.toLowerCase()}`), used);

            const uremaining = client.functions.get("fetchTime")(used, client, db.language)
            const embed = new Embed()
                .setColor("#A52F05")
                .setDescription(`<@${message.authorId}>, ${client.translate.get(db.language, "Events.messageCreate.wait")} \`${uremaining}\` ${client.translate.get(db.language, "Events.messageCreate.wait2")} \`${cmd.toLowerCase()}\` ${client.translate.get(db.language, "Events.messageCreate.wait3")}.`)

            return message.reply({ embeds: [embed] }, false).catch(() => { return })
        } else {
            let cooldown = commandfile.config.cooldown;
            client.used.set(`${message.authorId}-${cmd.toLowerCase()}`, cooldown);
            setTimeout(() => client.used.delete(`${message.authorId}-${cmd.toLowerCase()}`), cooldown);

            return commandfile.run(client, message, message.content.slice(db.prefix.length).slice(cmd.length).trim().split(/ +/g), db);
        };
    }
} 
