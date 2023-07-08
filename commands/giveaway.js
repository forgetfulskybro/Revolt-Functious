const Embed = require(`../functions/embed`)
const Giveaways = require(`../models/giveaways`)
const dhms = require(`../functions/dhms`);
const regex = new RegExp(`channel:( |)(<#!?(.*)>|.*)`)
module.exports = {
    config: {
        name: `giveaway`,
        usage: true,
        cooldown: 5000,
        permissions: [`ManageServer`],
        available: true,
        aliases: ["gw", "gstart"],
    },
    run: async (client, message, args, db) => {
        const check = await Giveaways.find({ serverId: message.server.id, ended: false })
        if (check.length === 15) return message.reply({ embeds: [new Embed().setDescription(client.translate.get(db.language, 'Commands.giveaway.tooMany')).setColor(`#FF0000`)] }, false);
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

            if (options[3] && regex.test(options[3])) channel = option[3] ? message.server.channels.find(e => e.id === option[3]) : message.server.channels.find(e => e.id === option[2])
            if (!channel) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.validChannel")}: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt | channel:#giveaways\`\n\n##### ${client.translate.get(db.language, "Commands.giveaway.validChannel2")}`).setColor(`#FF0000`)] });
            if (channel === true || /^\s*$/.test(requirement)) channel = message.channel
        } else { requirement = null; channel = message.channel; }

        if (!time) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.validTime")}: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false);
        if (Array.from({ length: 299000 }, (_, i) => i + 1).includes(dhms(time))) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.ormore")}: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false)
        if (time > 31556952000) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.orless")}: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false);
        if (!isNaN(time) || dhms(time) <= 0) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.format")}: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false)
        if (!winners) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.validWinners")}: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false);
        if (winners <= 0 || isNaN(winners)) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.formatWinners")}: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false)
        if (winners > 5) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.maxwins")}: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false)
        if (!options[2]) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.validPrize")}: \`${client.config.prefix}giveaway 20m | 3 | A t-shirt\``).setColor(`#FF0000`)] }, false);

        const embed = new Embed()
            .setColor("#A52F05")
            .setTitle(client.translate.get(db.language, "Commands.giveaway.giveaway"))
            .setDescription(`${client.translate.get(db.language, "Commands.giveaway.react")} ${client.config.emojis.confetti} ${client.translate.get(db.language, "Commands.giveaway.react2")}!\n${client.translate.get(db.language, "Commands.giveaway.hosted")}: <@${message.authorId}>\n\n${client.translate.get(db.language, "Commands.giveaway.time")}: <t:${Math.floor((dhms(time) + Date.now()) / 1000)}:R>\n${client.translate.get(db.language, "Commands.giveaway.prize")}: ${prize}\n${client.translate.get(db.language, "Commands.giveaway.winners")}: ${winners}${requirement ? `\n${client.translate.get(db.language, "Commands.giveaway.reqs")}: ${requirement.slice(0, 500)}` : ``}`)

        if (!channel.havePermission("SendMessage")) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.noperms")} <#${channel.id}>`).setColor(`#FF0000`)] }, false);
        if (!channel.havePermission("ViewChannel")) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.noperms2")} <#${channel.id}>`).setColor(`#FF0000`)] });
        if (!channel.havePermission("React")) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.noperms3")} <#${channel.id}>`).setColor(`#FF0000`)] }, false);

        if (options[3] && regex.test(options[3]) || /^\s*$/.test(requirement)) { message.reply(`${client.translate.get(db.language, "Commands.giveaway.success")} <#${channel.id}>`, false) }
        else message.delete().catch(() => { });

        channel.sendMessage({ embeds: [embed], interactions: [reactions] }).then(async msg => {
            await Giveaways.create({
                owner: message.authorId,
                serverId: message.server.id,
                channelId: channel.id,
                messageId: msg.id,
                time: dhms(time),
                now: Date.now(),
                prize: prize,
                winners: winners,
                lang: db.language,
                requirement: requirement
            });
        });
    }
};
