const Embed = require(`../functions/embed`)
const Polls = require(`../functions/poll`)
const dhms = require(`../functions/dhms`);
const PollDB = require("../models/polls");
const SavedPolls = require(`../models/savedPolls`)

module.exports = {
    config: {
        name: `polls`,
        description: `Creates a poll. Reactions have 3 second cooldown.`,
        usage: `[Time, E.g. 10m] | [Question] | [Option 1] | [Option 2] | [Options 3-10 (Optional)]`,
        cooldown: 1000,
        available: true,
        permissions: [],
        aliases: ["poll"]
    },
    run: async (client, message, args) => {
        const check = await PollDB.find({ owner: message.authorId })
        if (check.length === 5) return message.reply({ embeds: [new Embed().setDescription(`You already have 5 polls running. Wait for one to end before creating anymore.`).setColor(`#FF0000`)] }, false);
        const options = args.join(` `).split(`|`).map(x => x.trim()).filter(x => x);
        if (!options[0]) return message.reply({ embeds: [new Embed().setDescription(`Please provide a time.\nExample: \`${client.config.prefix}polls 5m | How are you? | Good | Bad\``).setColor(`#FF0000`)] }, false);
        if (!options[1]) return message.reply({ embeds: [new Embed().setDescription(`Please provide a question.\nExample: \`${client.config.prefix}polls 5m | How are you? | Good | Bad\``).setColor(`#FF0000`)] }, false);
        if (!options[2]) return message.reply({ embeds: [new Embed().setDescription(`Please provide the first option for the question. Maximum of 5 options.\nExample: \`${client.config.prefix}polls 5m | How are you? | Good | Bad\``).setColor(`#FF0000`)] }, false);
        if (!options[3]) return message.reply({ embeds: [new Embed().setDescription(`Please provide the second option for the question. Maximum of 5 options.\nExample: \`${client.config.prefix}polls 5m | How are you? | Good | Bad\``).setColor(`#FF0000`)] }, false);
        if (options.length >= 13) return message.reply({ embeds: [new Embed().setDescription(`Please provide a maximum of 10 options.\nExample: \`${client.config.prefix}polls 5m | How are you? | Good | Bad\``).setColor(`#FF0000`)] }, false);
        
        const time = dhms(options[0]);
        if (!time) return message.reply({ embeds: [new Embed().setDescription(`Please provide a valid time.\nExample: \`${client.config.prefix}polls 5m | How are you? | Good | Bad\``).setColor(`#FF0000`)] }, false);
        if (time === 0) return message.reply({ embeds: [new Embed().setDescription(`Please provide a valid time.\nExample: \`${client.config.prefix}polls 5m | How are you? | Good | Bad\``).setColor(`#FF0000`)] }, false);
        if (time < 30000) return message.reply({ embeds: [new Embed().setDescription(`Please provide a time longer than 30 seconds.\nExample: \`${client.config.prefix}polls 5m | How are you? | Good | Bad\``).setColor(`#FF0000`)] }, false);
        if (time > 2592000000) return message.reply({ embeds: [new Embed().setDescription(`Please provide a time shorter than 30 days.\nExample: \`${client.config.prefix}polls 5m | How are you? | Good | Bad\``).setColor(`#FF0000`)] }, false);

        const names = [options[2], options[3], options[4] ? options[4] : null, options[5] ? options[5] : null, options[6] ? options[6] : null, options[7] ? options[7] : null, options[8] ? options[8] : null, options[9] ? options[9] : null, options[10] ? options[10] : null, options[11] ? options[11] : null];
        const reactions = [client.config.emojis.one, client.config.emojis.two, options[4] ? client.config.emojis.three : null, options[5] ? client.config.emojis.four : null, options[6] ? client.config.emojis.five : null, options[7] ? client.config.emojis.six : null, options[8] ? client.config.emojis.seven : null, options[9] ? client.config.emojis.eight : null, options[10] ? client.config.emojis.nine : null, options[11] ? client.config.emojis.ten : null, client.config.emojis.stop];

        const poll = new Polls({ time, client, name: { name: `Polls`, description: options[1] }, options: { name: names.filter(a => a) }, owner: message.authorId })
        await poll.update();

        let tooMuch = [];
        if (options[1].length > 80) tooMuch.push(`**Title**: ${options[1]}`)
        names.filter(e => e).forEach((e, i) => {
            i++
            if (e.length > 70) {
                tooMuch.push(`**${i}.** ${e}`)
            }
        });
        message.channel.sendMessage({ embeds: [new Embed().setDescription(tooMuch.length > 0 ? tooMuch.map(e => e).join("\n") : null).setMedia(await client.Uploader.upload(poll.canvas.toBuffer(), `Poll.png`)).setColor(`#A52F05`)], interactions: [reactions.filter(e => e)] }).then((msg) => {
            poll.start(msg, poll);
        });

        await (new SavedPolls({
            owner: message.authorId,
            desc: options[1],
            options: { name: names }
        }).save());
    },
};
