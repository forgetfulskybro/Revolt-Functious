const Embed = require("../functions/embed")
module.exports = async (client, message) => {
    if (!message) return;
    if (!message.channel.server) return;
    if (!message.content) return;
    if (message.author.bot) return;

    let args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();

    const mention = new Embed()
        .setColor("#A52F05")
        .setTitle(client.user.username)
        .setIcon(client.user.avatarURL)
        .setDescription(`Hello, I'm ${client.user.username}! My prefix is \`${client.config.prefix}\`\nTo get started, type \`${client.config.prefix}help\``)

    if (message.content && (new RegExp(`^(<@!?${client.user.id}>)`)).test(message.content)) return message.reply({
        embeds: [mention]
    }, false).catch(() => { return });

    let commandfile = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    if (commandfile) {
        if (!message.content.startsWith(client.config.prefix)) return;
        if (!message.channel.havePermission("SendMessage")) return message.member.user.openDM().then((dm) => { dm.sendMessage(`Unable to send messages in <#${message.channelId}>, please contact a server administrator to get this settled.`) }).catch(() => { return });
        if (!message.channel.havePermission("React")) return message.reply(`Need permission to react as all of my features use reactions. Please contact a server administrator to get this settled.`, false).catch(() => { return });

        if (!commandfile.config.available && commandfile.config.available !== "Owner" && !client.config.owners.includes(message.authorId)) return message.reply({ embeds: [new Embed().setColor("#FF0000").setDescription(`This command is currently unavailable.`)] }, false).catch(() => { return });
        if (commandfile.config.permissions.length > 0 && !message.member.hasPermission(message.channel.server, commandfile.config.permissions[0]) && !client.config.owners.includes(message.authorId)) return message.reply({ embeds: [new Embed().setColor("#FF0000").setDescription(`You don't have the required permissions to use this command.\nPermission needed: [${commandfile.config.permissions[0]}]`)] }, false).catch(() => { return });

        const used = client.used.get(message.authorId + "-" + cmd.toLowerCase())
        if (used) {
            if (client.timeout.get(message.authorId + "-" + cmd.toLowerCase())) return;

            client.timeout.set(message.authorId + "-" + cmd.toLowerCase(), used)
            setTimeout(() => client.timeout.delete(message.authorId + "-" + cmd.toLowerCase()), used)

            const uremaining = client.functions.get("fetchTime")(used)
            const embed = new Embed()
                .setColor("#A52F05")
                .setDescription(`<@${message.authorId}>, wait \`${uremaining.replace("(s)", "s")}\` before using \`${cmd.toLowerCase()}\` again.`)

            return message.reply({ embeds: [embed] }, false).catch(() => { return })
        } else {
            let cooldown = commandfile.config.cooldown;
            client.used.set(message.authorId + "-" + cmd.toLowerCase(), cooldown)
            setTimeout(() => client.used.delete(message.authorId + "-" + cmd.toLowerCase()), cooldown)

            return commandfile.run(client, message, message.content.slice(client.config.prefix.length).slice(cmd.length).trim().split(/ +/g));
        };
    }
} 
