const Embed = require(`../functions/embed`)
const Giveaways = require(`../models/giveaways`)
const dhms = require(`../functions/dhms`);
const regex = new RegExp(`channel:( |)(<#!?(.*)>|.*)`)
module.exports = {
    config: {
        name: `giveaway`,
        description: `Creates a giveaway. Reactions have 3 second cooldown.`,
        usage: `[Time, E.g. 20m] | [Winners] | [Prize] | [Requirement (Optional)] [Channel (Optional), E.g. channel:#giveaways]`,
        cooldown: 5000,
        permissions: [`ManageServer`],
        available: true,
        aliases: ["gw", "gstart"],
    },
    run: async (client, message, args) => {
        const check = await Giveaways.find({ serverId: message.channel.serverId, ended: false })
        if (check.length === 15) return message.reply({ embeds: [new Embed().setDescription(`This server has 15 giveaways currently running. Wait until one finishes before making anymore!`).setColor(`#FF0000`)] }, false);
        const options = args.join(` `).split(`|`).map(x => x.trim()).filter(x => x);
        const prize = options[2] ? options[2].slice(0, 500) : null;
        const winners = options[1];
        const time = options[0];
        const reactions = [client.config.emojis.confetti, client.config.emojis.stop]

        let requirement;
        let channel = true;
        if (options[3]) {
            let option = options[3] ? options[3].match(regex) : null;
            requirement = options[3].slice(0, 500).replace(`${option ? option[0] : ''}`, "").trim();
            if (requirement.length === 0) requirement = null;

            if (options[3] && regex.test(options[3])) channel = option[3] ? message.channel.server.channels.find(e => e.id === option[3]) : message.channel.server.channels.find(e => e.id === option[2])
            if (!channel) return message.reply({ embeds: [new Embed().setDescription(`Please provide a valid channel mention or channel ID.\nExample: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt | channel:#giveaways\`\n\n##### Note: If you are using a channel ID, provide it after the requirement text`).setColor(`#FF0000`)] });
            if (channel === true || /^\s*$/.test(requirement)) channel = message.channel
        } else { requirement = null; channel = message.channel; }

        if (!time) return message.reply({ embeds: [new Embed().setDescription(`Please provide a time.\nExample: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false);
        if (!winners) return message.reply({ embeds: [new Embed().setDescription(`Please provide the amount of winners. Maximum: 5\nExample: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false);
        if (!options[2]) return message.reply({ embeds: [new Embed().setDescription(`Please provide the prize.\nExample: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false);
        if (Array.from({ length: 299000 }, (_, i) => i + 1).includes(dhms(time))) return message.reply({ embeds: [new Embed().setDescription(`Giveaways can only be 5 minutes or above in time!\nExample: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false)
        if (time > 31556952000) return message.reply({ embeds: [new Embed().setDescription(`Please provide a time shorter than 365 days.\nExample: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false);
        if (!isNaN(time) || dhms(time) <= 0) return message.reply({ embeds: [new Embed().setDescription(`You failed to follow the giveaway format.\nExample: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false)
        if (winners <= 0 || isNaN(winners)) return message.reply(`You failed to properly specify how many winners there are!\nExample: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``, false)
        if (winners > 5) return message.reply(`When making a giveaway, you can only have a maximum of 5 winners!\nExample: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``, false)

        const embed = new Embed()
            .setColor("#A52F05")
            .setTitle(`Giveaway`)
            .setDescription(`React with ${client.config.emojis.confetti} to enter!\nHosted by: <@${message.authorId}>\n\nTime: <t:${Math.floor((dhms(time) + Date.now()) / 1000)}:R>\nPrize: ${prize}\nWinners: ${winners}${requirement ? `\nRequirement: ${requirement.slice(0, 500)}` : ``}`)

        if (!channel.havePermission("SendMessage")) return message.reply({ embeds: [new Embed().setDescription(`I do not have permission to send messages in <#${channel.id}>`).setColor(`#FF0000`)] }, false);
        if (!channel.havePermission("ViewChannel")) return message.reply({ embeds: [new Embed().setDescription(`I do not have permission to view <#${channel.id}>`).setColor(`#FF0000`)] });
        if (!channel.havePermission("React")) return message.reply({ embeds: [new Embed().setDescription(`I do not have permission to add reactions in <#${channel.id}>`).setColor(`#FF0000`)] }, false);

        if (options[3] && regex.test(options[3]) || /^\s*$/.test(requirement)) { message.reply(`Successfully sent giveaway to <#${channel.id}>`, false) }
        else message.delete().catch(() => { });

        channel.sendMessage({ embeds: [embed], interactions: [reactions] }).then(async msg => {
            await (new Giveaways({
                owner: message.authorId,
                serverId: message.channel.serverId,
                channelId: channel.id,
                messageId: msg.id,
                time: dhms(time),
                now: Date.now(),
                prize: prize,
                winners: winners,
                requirement: requirement
            }).save())
        });
    }
};
