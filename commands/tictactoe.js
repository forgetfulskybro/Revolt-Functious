const Embed = require("../functions/embed")
const Members = require("../functions/members");
//const TTT = require(`../functions/ttt`)

module.exports = {
    config: {
        name: "tictactoe",
        description: "Tic Tac Toe game with your friends!",
        usage: "[mention | reply]",
        cooldown: 7000,
        available: true,
        permissions: [],
        aliases: ['ttt'],
    },
    run: async (client, message, args) => {
        const ids = message.mention_ids ? message.mention_ids[0] : message.reply_ids ? client.messages.get(message.reply_ids[0]) ? client.messages.get(message.reply_ids[0]).author_id : null : null

        if (!ids) return message.reply({ embeds: [new Embed().setDescription(`You need to mention or reply to someone's message to play this game!\n\n#### Possible error: replied message isn't cached. Try again.`).setColor(`#FF0000`)] });
        if (ids === message.author._id) return message.reply({ embeds: [new Embed().setDescription(`You can't play alone... sorry.`).setColor(`#FF0000`)] });

        let user;
        const members = await Members(client, message.channel.server._id)
        if (!members.members.find(u => u._id.user === ids)) return message.reply({ embeds: [new Embed().setColor("#FF0000").setDescription(`Mentioned user isn't in this server!`)] })
        else { user = members.users.find(u => u._id === ids) }

        // if (user._id === client.user._id) {
        //     const starterPiece = Math.floor(Math.random() * 2) === 0 ? `❌` : `⭕`
        //     const reactions = [client.config.emojis.one, client.config.emojis.two, client.config.emojis.three, client.config.emojis.four, client.config.emojis.five, client.config.emojis.six, client.config.emojis.seven, client.config.emojis.eight, client.config.emojis.nine]
        //     const ttt = new TTT({ client, p1: { username: message.author.username.length > 28 ? message.author.username.slice(0, 25) : message.author.username, id: message.author._id }, p2: { username: client.user.username, id: client.user._id }, starterPiece: starterPiece })
        //     await ttt.draw();

        //     return message.channel.sendMessage({ content: starterPiece === "❌" ? `<@${message.author._id}> turn` : `<@${client.user._id}> turn`, embeds: [new Embed().setMedia(await client.Uploader.upload(ttt.canvas.toBuffer(), `TTT.png`)).setColor(`#A52F05`)], interactions: [reactions] }).then((msg) => {
        //         ttt.start(msg, ttt);
        //     });
        // } // Possibly in the future :trol:

        if (user.bot) return message.reply({ embeds: [new Embed().setDescription(`You can't play with bots. !!At least for now :trol:!!`).setColor(`#FF0000`)] });

        const reactions = [client.config.emojis.check, client.config.emojis.cross]
        message.reply({ content: `<@${user._id}>`, embeds: [new Embed().setDescription(`Do you accept this challenge of TicTacToe? (25 seconds until closes)`).setColor(`#A52F05`)], interactions: [reactions] }).then(msg => {
            client.accept.set(msg._id, { user: { username: user.username, id: user._id }, author: { username: message.author.username, id: message.author._id } });
            setTimeout(() => { if (!client.accept.get(msg._id)) return; client.accept.delete(msg._id); msg.edit({ content: `<@${message.author._id}>`, embeds: [new Embed().setDescription(`Opponent did not accept in time!`).setColor(`#FF0000`)] }) }, 25000)
        });
    },
};
