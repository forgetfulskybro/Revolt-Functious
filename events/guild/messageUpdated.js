const Embed = require("../../functions/embed");
const PollDB = require("../../models/polls");
const Giveaways = require("../../models/giveaways");
const TTT = require(`../../functions/ttt`)

function convert(emoji) {
    if (emoji === `1️⃣`) return 0;
    if (emoji === `2️⃣`) return 1;
    if (emoji === `3️⃣`) return 2;
    if (emoji === `4️⃣`) return 3;
    if (emoji === `5️⃣`) return 4;
    if (emoji === `6️⃣`) return 5;
    if (emoji === `7️⃣`) return 6;
    if (emoji === `8️⃣`) return 7;
    if (emoji === `9️⃣`) return 8;
};

function convertNum(emoji) {
    if (emoji === 0) return `1️⃣`;
    if (emoji === 1) return `2️⃣`;
    if (emoji === 2) return `3️⃣`;
    if (emoji === 3) return `4️⃣`;
    if (emoji === 4) return `5️⃣`;
    if (emoji === 5) return `6️⃣`;
    if (emoji === 6) return `7️⃣`;
    if (emoji === 7) return `8️⃣`;
    if (emoji === 8) return `9️⃣`;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = async (client, message, newMsg) => {
    if (newMsg.data && newMsg.data.content && newMsg.type === "MessageUpdate") {
        const testCmd = client.commands.get(newMsg.data.content.slice(client.config.prefix.length)) || client.aliases.get(newMsg.data.content.slice(client.config.prefix.length));
        if (!testCmd || testCmd && testCmd.config.name === "ping") return;
        client.emit("message", message)
    } else if (newMsg.type === "MessageReact") {
        const paginateCheck = client.paginate.get(newMsg.user_id);
        const pollCheck = client.polls.get(message._id);
        const tttCheck = client.ttt.get(message._id);
        const tttAccept = client.accept.get(message._id);
        if (tttAccept) {
            switch (newMsg.emoji_id) {
                case client.config.emojis.check:
                    if (tttAccept.user.id !== newMsg.user_id) return;
                    client.accept.delete(message._id);
                    message.delete().catch(() => { })

                    const starterPiece = Math.floor(Math.random() * 2) === 0 ? `❌` : `⭕`
                    const reactions = [client.config.emojis.one, client.config.emojis.two, client.config.emojis.three, client.config.emojis.four, client.config.emojis.five, client.config.emojis.six, client.config.emojis.seven, client.config.emojis.eight, client.config.emojis.nine, client.config.emojis.stop]
                    const ttt = new TTT({ client, p1: { username: tttAccept.author.username.length > 22 ? tttAccept.author.username.slice(0, 19) : tttAccept.author.username, id: tttAccept.author.id }, p2: { username: tttAccept.user.username.length > 22 ? tttAccept.user.username.slice(0, 19) : tttAccept.user.username, id: tttAccept.user.id }, starterPiece: starterPiece })
                    await ttt.draw();

                    message.channel.sendMessage({ content: starterPiece === "❌" ? `<@${tttAccept.author.id}> turn` : `<@${tttAccept.user.id}> turn`, embeds: [new Embed().setMedia(await client.Uploader.upload(ttt.canvas.toBuffer(), `TTT.png`)).setColor(`#A52F05`)], interactions: [reactions] }).then((msg) => {
                        ttt.start(msg, ttt);
                    });
                    break;
                case client.config.emojis.cross:
                    if (tttAccept.user.id !== newMsg.user_id) return;
                    client.accept.delete(message._id);
                    message.edit({ content: `<@${tttAccept.author.id}>`, embeds: [new Embed().setDescription(`<@${newMsg.user_id}> has declined your challenge!`).setColor(`#A52F05`)] });
                    break;
            }
        } else if (paginateCheck) {
            if (paginateCheck.message !== message._id) return;
            let pages = paginateCheck.pages;
            let page = paginateCheck.page;
            switch (newMsg.emoji_id) {
                case "⏪":
                    if (page !== 0) {
                        message.edit({
                            embeds: [pages[0]]
                        }).catch(() => { });
                        return paginateCheck.page = 0
                    } else {
                        return;
                    }
                case "⬅️":
                    if (pages[page - 1]) {
                        message.edit({
                            embeds: [pages[--page]]
                        }).catch(() => { });
                        return paginateCheck.page = paginateCheck.page - 1
                    } else {
                        return;
                    }
                case "➡️":
                    if (pages[page + 1]) {
                        message.edit({
                            embeds: [pages[++page]]
                        }).catch(() => { });
                        return paginateCheck.page = paginateCheck.page + 1
                    } else {
                        return;
                    }
                case "⏩":
                    if (page !== pages.length) {
                        message.edit({
                            embeds: [pages[pages.length - 1]]
                        }).catch(() => { });
                        return paginateCheck.page = pages.length - 1
                    } else {
                        return;
                    }
            }
        } else if (pollCheck) {
            if (newMsg.emoji_id === client.config.emojis.one && !pollCheck.users.includes(newMsg.user_id)) {
                pollCheck.users.push(newMsg.user_id);
                let user = await client.users.get(newMsg.user_id);
                if (!user) user = await client.api.get(`/users/${newMsg.user_id}`).then(res => client.users.createObj(res, true)).catch(() => { });
                await pollCheck.poll.addVote(0, newMsg.user_id, user && user.avatar && user.avatar._id ? `https://autumn.revolt.chat/avatars/${user.avatar._id}` : `https://api.revolt.chat/users/${newMsg.user_id}/default_avatar`, message._id);
                message.edit({ embeds: [new Embed().setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#A52F05")] }).catch(() => { });
            } else if (newMsg.emoji_id === client.config.emojis.two && !pollCheck.users.includes(newMsg.user_id)) {
                pollCheck.users.push(newMsg.user_id);
                let user = await client.users.get(newMsg.user_id);
                if (!user) user = await client.api.get(`/users/${newMsg.user_id}`).then(res => client.users.createObj(res, true)).catch(() => { });
                await pollCheck.poll.addVote(1, newMsg.user_id, user && user.avatar && user.avatar._id ? `https://autumn.revolt.chat/avatars/${user.avatar._id}` : `https://api.revolt.chat/users/${newMsg.user_id}/default_avatar`, message._id);
                message.edit({ embeds: [new Embed().setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#A52F05")] }).catch(() => { });
            } else if (newMsg.emoji_id === client.config.emojis.three && !pollCheck.users.includes(newMsg.user_id)) {
                pollCheck.users.push(newMsg.user_id);
                let user = await client.users.get(newMsg.user_id);
                if (!user) user = await client.api.get(`/users/${newMsg.user_id}`).then(res => client.users.createObj(res, true)).catch(() => { });
                await pollCheck.poll.addVote(2, newMsg.user_id, user && user.avatar && user.avatar._id ? `https://autumn.revolt.chat/avatars/${user.avatar._id}` : `https://api.revolt.chat/users/${newMsg.user_id}/default_avatar`, message._id);
                message.edit({ embeds: [new Embed().setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#A52F05")] }).catch(() => { });
            } else if (newMsg.emoji_id === client.config.emojis.four && !pollCheck.users.includes(newMsg.user_id)) {
                pollCheck.users.push(newMsg.user_id);
                let user = await client.users.get(newMsg.user_id);
                if (!user) user = await client.api.get(`/users/${newMsg.user_id}`).then(res => client.users.createObj(res, true)).catch(() => { });
                await pollCheck.poll.addVote(3, newMsg.user_id, user && user.avatar && user.avatar._id ? `https://autumn.revolt.chat/avatars/${user.avatar._id}` : `https://api.revolt.chat/users/${newMsg.user_id}/default_avatar`, message._id);
                message.edit({ embeds: [new Embed().setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#A52F05")] }).catch(() => { });
            } else if (newMsg.emoji_id === client.config.emojis.five && !pollCheck.users.includes(newMsg.user_id)) {
                pollCheck.users.push(newMsg.user_id);
                let user = await client.users.get(newMsg.user_id);
                if (!user) user = await client.api.get(`/users/${newMsg.user_id}`).then(res => client.users.createObj(res, true)).catch(() => { });
                await pollCheck.poll.addVote(4, newMsg.user_id, user && user.avatar && user.avatar._id ? `https://autumn.revolt.chat/avatars/${user.avatar._id}` : `https://api.revolt.chat/users/${newMsg.user_id}/default_avatar`, message._id);
                message.edit({ embeds: [new Embed().setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#A52F05")] }).catch(() => { });
            } else if (newMsg.emoji_id === client.config.emojis.stop && newMsg.user_id === pollCheck.owner) {
                await PollDB.findOneAndDelete({ messageId: message._id });
                await pollCheck.poll.update();
                message.edit({ content: `Owner (<@${pollCheck.owner}>) ended the poll early. These are the final results:`, embeds: [new Embed().setMedia(await client.Uploader.upload(pollCheck.poll.canvas.toBuffer(), `Poll.png`)).setColor("#F24646")] }).catch(() => { });
                client.polls.delete(message._id);
            }
        } else if (tttCheck) {
            if (newMsg.emoji_id === client.config.emojis.stop && newMsg.user_id === tttCheck.users.p1.user.id || newMsg.emoji_id === client.config.emojis.stop && newMsg.user_id === tttCheck.users.p2.user.id) {
                tttCheck.ttt.draw({ ff: newMsg.user_id });
                message.edit({ content: `Game ended! <@${newMsg.user_id}> forfeited the game!`, embeds: [new Embed().setMedia(await client.Uploader.upload(tttCheck.ttt.canvas.toBuffer(), `TicTacToe.png`)).setColor("#F24646")] }).catch(() => { });
                return client.ttt.delete(message._id);
            }

            if (tttCheck.ttt.move(convert(newMsg.emoji_id)) && newMsg.user_id === tttCheck.turn) {
                tttCheck.ttt.move(convert(newMsg.emoji_id), newMsg.user_id === tttCheck.users.p1.user.id ? tttCheck.users.p1.piece : tttCheck.users.p2.piece);
                tttCheck.ttt.draw();

                if (tttCheck.ttt.checkWin()) {
                    let check = tttCheck.ttt.checkWin()
                    let winner = check.winner === tttCheck.users.p1.piece ? tttCheck.users.p1 : tttCheck.users.p2; // winner.user.id === tttCheck.users.p1.id ? tttCheck.users.p1.piece === client.config.emojis.x ? `#E23232` : `#3F3FEC` : tttCheck.users.p2.piece === client.config.emojis.x ? `#E23232` : `#3F3FEC`
                    tttCheck.ttt.draw({ dir: check.dir, color: `#000000`, user: winner.user.id, tie: false });
                    message.edit({ content: `<@${winner.user.id}> (${winner.piece}) won!`, embeds: [new Embed().setMedia(await client.Uploader.upload(tttCheck.ttt.canvas.toBuffer(), `TTT.png`)).setColor("#F24646")] }).catch(() => { });
                    return client.ttt.delete(message._id);
                } else if (tttCheck.ttt.tie()) {
                    tttCheck.ttt.draw({ tie: true });
                    message.edit({ content: `It's a cat game (tie)!`, embeds: [new Embed().setMedia(await client.Uploader.upload(tttCheck.ttt.canvas.toBuffer(), `TTT.png`)).setColor("#F24646")] }).catch(() => { });
                    return client.ttt.delete(message._id);
                }

                let emoji;
                if (tttCheck.turn === tttCheck.users.p1.user.id) { tttCheck.turn = tttCheck.users.p2.user.id; emoji = tttCheck.users.p2.piece }
                else { tttCheck.turn = tttCheck.users.p1.user.id; emoji = tttCheck.users.p1.piece }

                clearTimeout(tttCheck.timer);
                tttCheck.timer = setTimeout(() => {
                    if (!client.ttt.get(message._id)) return;
                    message.edit({ content: "This TTT game has ended due to no activity for 2 minutes!" }).catch(() => { });
                    client.ttt.delete(message._id);
                }, 120000);

                return message.edit({ content: `<@${tttCheck.turn}> turn (${emoji})`, embeds: [new Embed().setMedia(await client.Uploader.upload(tttCheck.ttt.canvas.toBuffer(), `TTT.png`)).setColor(`#A52F05`)] }).catch(() => { });
                // if (tttCheck.users.p2.user.id === client.user._id && newMsg.user_id !== client.user._id) {
                //     if (!tttCheck) return;
                //     hasWon = (player) => {
                //         const allPossibleWins = [
                //             [1, 2, 3],
                //             [4, 5, 6],
                //             [7, 8, 9],
                //             [1, 4, 7],
                //             [2, 5, 8],
                //             [3, 6, 9],
                //             [1, 5, 9],
                //             [3, 5, 7],
                //         ],
                //             flattened = tttCheck.ttt.checkBoard().flat(),
                //             winCheck = !!allPossibleWins
                //                 .map(
                //                     (win) =>
                //                         win
                //                             .map((index) => flattened[index - 1])
                //                             .filter((e) => e === player).length === 3
                //                 )
                //                 .filter((element) => element).length;
                //         return winCheck;
                //     },
                //         getAvailableStates = () => {
                //             const availablePoints = [];
                //             for (let i = 0; i < 9; ++i) {
                //                 if (tttCheck.ttt.checkBoard()[i] === null) availablePoints.push({ x: i, });
                //             }
                //             return availablePoints;
                //         },
                //         minimax = (depth, isMax) => {
                //             let currentSpots = getAvailableStates();
                //             if (hasWon(tttCheck.users.p1.piece)) return -10;
                //             else if (hasWon(tttCheck.users.p2.piece)) return 10;
                //             else if (currentSpots.length === 0) return 0;
                //             let bestScore = isMax ? -Infinity : Infinity
                //             for (let i = 0; i < 6; i++) {
                //                 if (!tttCheck.ttt.checkBoard()[i]) {
                //                     tttCheck.ttt.checkBoard()[i] = isMax ? 2 : 1;
                //                     let score = minimax(depth + 1, !isMax);
                //                     tttCheck.ttt.checkBoard()[i] = null;
                //                     bestScore = Math[isMax ? "max" : "min"](score, bestScore);
                //                 }
                //             }
                //             return bestScore;
                //         },
                //         bestMove = () => {
                //             let bestScore = -Infinity;
                //             let moves = []
                //             for (let i = 0; i < 9; i++) {
                //                 if (!tttCheck.ttt.checkBoard()[i]) {
                //                     tttCheck.ttt.checkBoard()[i] = 2;
                //                     let score = minimax(0, false);
                //                     tttCheck.ttt.checkBoard()[i] = null;
                //                     if (score > bestScore) {
                //                         bestScore = score;
                //                         moves.push({ i })
                //                     }
                //                 }
                //             }

                //             return moves[moves.length - 1]
                //         }

                //     await sleep(2500);
                //     return client.messages.get(message._id).react(encodeURI(convertNum(bestMove().i))).catch((e) => { message.reply(`Error while bot reacting: ${e.message}`) });
                // }
            }
        } else {
            const db = await Giveaways.findOne({ messageId: message._id });
            if (newMsg.emoji_id === client.config.emojis.confetti && db && !db.ended) {
                if (client.reactions.get(newMsg.user_id)) return;
                if (db.users.find(u => u.userID === newMsg.user_id)) return;
                db.users.push({ userID: newMsg.user_id });
                db.picking.push({ userID: newMsg.user_id });
                db.save();

                client.reactions.set(newMsg.user_id, Date.now() + 3000)
                setTimeout(() => client.reactions.delete(newMsg.user_id), 3000)

                client.users.get(newMsg.user_id).openDM().then(dm => dm.sendMessage(`You joined giveaway [${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})!\nThere's currently **${db.users.length}** user(s) in this giveaway`)).catch(() => { });
            } else if (newMsg.emoji_id === client.config.emojis.stop && db && db.owner === newMsg.user_id && !db.ended) {
                let endDate = Date.now();

                if (db.users.length === 0) {
                    const noUsers = new Embed()
                        .setColor("#A52F05")
                        .setTitle(`Giveaway`)
                        .setDescription(`Owner (<@${newMsg.user_id}>) ended the giveaway early\nNo one entered into the giveaway so I couldn't pick a winner!\n\nEnded: <t:${Math.floor((endDate) / 1000)}:R>\nPrize: ${db.prize}\nWinner(s): None${db.requirement ? `\nRequirement: ${db.requirement}` : ``}`)

                    await db.updateOne({ ended: true, endDate: endDate })
                    await db.save();
                    return await client.api.patch(`/channels/${db.channelId}/messages/${db.messageId}`, { "embeds": [noUsers] });
                }

                for (let i = 0; i < db.winners; i++) {
                    let winner = db.picking[Math.floor(Math.random() * db.picking.length)];
                    if (winner) {
                        const filtered = db.picking.filter(object => object.userID != winner.userID)
                        db.picking = filtered;
                        db.pickedWinners.push({ id: winner.userID })
                    }
                }

                await db.updateOne({ ended: true, endDate: endDate })
                await db.save();

                const noUsers = new Embed()
                    .setColor("#A52F05")
                    .setTitle(`Giveaway`)
                    .setDescription(`Owner (<@${newMsg.user_id}>) ended the giveaway early\nParticipants: ${db.users.length}\n\nEnded: <t:${Math.floor((endDate) / 1000)}:R>\nPrize: ${db.prize}\nWinner(s): ${db.pickedWinners.length > 0 ? db.pickedWinners.map(w => `<@${w.id}>`).join(", ") : "None"}${db.requirement ? `\nRequirement: ${db.requirement}` : ``}`)

                message.edit({ embeds: [noUsers] }).catch(() => { });
                await client.api.post(`/channels/${db.channelId}/messages`, { "content": `Congratulations ${db.pickedWinners.map(w => `<@${w.id}>`).join(", ")}! You won the giveaway for **[${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})**!`, replies: [{ id: db.messageId, mention: false }] }).catch(() => { });
                client.reactions.set(newMsg.user_id, Date.now() + 3000)
                setTimeout(() => client.reactions.delete(newMsg.user_id), 3000)
            }
        }
    } else if (newMsg.type === "MessageUnreact") {
        if (client.reactions.get(newMsg.user_id)) return;
        const db = await Giveaways.findOne({ messageId: message._id });
        if (!db) return;
        if (db.ended) return;
        if (newMsg.emoji_id === client.config.emojis.confetti) {
            if (!db.users.find(u => u.userID === newMsg.user_id)) return;
            const filtered = db.users.filter(object => object.userID != newMsg.user_id)
            db.users = filtered;
            const filtered2 = db.picking.filter(object => object.userID != newMsg.user_id)
            db.picking = filtered2;
            db.save();

            client.reactions.set(newMsg.user_id, Date.now() + 3000)
            setTimeout(() => client.reactions.delete(newMsg.user_id), 3000)

            client.users.get(newMsg.user_id).openDM().then(dm => dm.sendMessage(`You left giveaway [${db.prize}](https://app.revolt.chat/server/${db.serverId}/channel/${db.channelId}/${db.messageId})!\nThere's now **${db.users.length}** user(s) left in this giveaway`)).catch(() => { });
        }
    }
} 