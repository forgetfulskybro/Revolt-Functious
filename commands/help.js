const Embed = require("../functions/embed")

module.exports = {
    config: {
        name: "help",
        description: "Help command",
        usage: "[command]",
        available: true,
        cooldown: 5000,
        permissions: [],
        aliases: []
    },
    run: async (client, message, args) => {
        if (args[0] && client.commands.filter(c => c.config.available !== "Owner").get(args[0].toLowerCase()) || client.commands.filter(c => c.config.available !== "Owner").find(c => c.config.aliases.includes(args[0].toLowerCase()))) {
            const command = client.commands.get(args[0].toLowerCase()) || client.commands.find(c => c.config.aliases.includes(args[0].toLowerCase()));
            if (!command) return

            const embed = new Embed()
                .setDescription(`### Command: ${command.config.name}\n\n**Description:** ${command.config.description}\n**Availability**: ${command.config.available ? "Available" : "Unavailable"}\n**Cooldown:** ${command.config.cooldown / 1000} seconds\n**Permissions:** ${command.config.permissions.length > 0 ? command.config.permissions.map(p => p).join(", ") : "None"}${command.config.aliases.length > 0 ? `\n**Aliases**: ${command.config.aliases.map(a => `\`${a}\``).join(", ")}` : ''}\n\n**Usage:**\`${client.config.prefix}${command.config.name} ${command.config.usage}\``)
                .setColor(`#A52F05`);

            return message.channel.sendMessage({ embeds: [embed] });
        }

        const embed = new Embed()
            .setDescription(`### Available Commands\n${client.commands.filter(c => c.config.available && c.config.available !== "Owner").map(c => `\`${c.config.name}\``).join(", ")}${client.commands.filter(c => c.config.available === false).size > 0 ? `\n### Unavailable Commands\n${client.commands.filter(c => c.config.available === false).map(c => `\`${c.config.name}\``).join(", ")}` : ""}\n\n##### To get more information about a command, type \`${client.config.prefix}help [command]\``)
            .setColor(`#A52F05`);

        message.channel.sendMessage({ embeds: [embed] })
    },
};
