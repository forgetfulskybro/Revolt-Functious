const Embed = require("../functions/embed")

module.exports = {
    config: {
        name: "help",
        available: true,
        cooldown: 3000,
        permissions: [],
        aliases: []
    },
    run: async (client, message, args, db) => {
        if (args[0] && client.commands.filter(c => c.config.available !== "Owner").get(args[0].toLowerCase()) || client.commands.filter(c => c.config.available !== "Owner").find(c => c.config.aliases.includes(args[0].toLowerCase()))) {
            const command = client.commands.get(args[0].toLowerCase()) || client.commands.find(c => c.config.aliases.includes(args[0].toLowerCase()));
            if (!command) return;

            let usage = '';
            if (command.config.usage) {
                usage = client.translate.get(db.language, `Commands.${command.config.name}.usage`);
            }

            const embed = new Embed()
                .setDescription(`### ${client.translate.get(db.language, 'Commands.help.embeds.first.cmdName')}: ${command.config.name}\n\n**${client.translate.get(db.language, 'Commands.help.embeds.first.cmdDesc')}**: ${client.translate.get(db.language, `Commands.${command.config.name}.description`)}\n**${client.translate.get(db.language, 'Commands.help.embeds.first.cmdAvail')}**: ${command.config.available ? `${client.translate.get(db.language, 'Commands.help.embeds.first.cmdAvail2')}` : `${client.translate.get(db.language, 'Commands.help.embeds.first.cmdAvail3')}`}\n**${client.translate.get(db.language, 'Commands.help.embeds.first.cmdCool')}**: ${command.config.cooldown / 1000} ${client.translate.get(db.language, 'Commands.help.embeds.first.cmdCool2')}\n**${client.translate.get(db.language, 'Commands.help.embeds.first.cmdPerms')}**: ${command.config.permissions.length > 0 ? command.config.permissions.map(p => p).join(", ") : `${client.translate.get(db.language, 'Commands.help.embeds.first.cmdPerms2')}`}${command.config.aliases.length > 0 ? `\n**${client.translate.get(db.language, 'Commands.help.embeds.first.cmdAlias')}**: ${command.config.aliases.map(a => `\`${a}\``).join(", ")}` : ''}\n\n**${client.translate.get(db.language, 'Commands.help.embeds.first.cmdUsage')}**:\`${client.config.prefix}${command.config.name} ${usage}\``)
                .setColor(`#A52F05`);

            return message.channel.sendMessage({ embeds: [embed] });
        }

        const embed = new Embed()
            .setDescription(`### ${client.translate.get(db.language, 'Commands.help.embeds.second.start')}\n${client.commands.filter(c => c.config.available && c.config.available !== "Owner").map(c => `\`${c.config.name}\``).join(", ")}${client.commands.filter(c => c.config.available === false).size > 0 ? `\n### ${client.translate.get(db.language, 'Commands.help.embeds.second.middle')}\n${client.commands.filter(c => c.config.available === false).map(c => `\`${c.config.name}\``).join(", ")}` : ""}\n\n##### ${client.translate.get(db.language, 'Commands.help.embeds.second.end')} \`${client.config.prefix}help [${client.translate.get(db.language, 'Commands.help.embeds.second.end2')}]\``)
            .setColor(`#A52F05`);

        message.channel.sendMessage({ embeds: [embed] })
    },
};
