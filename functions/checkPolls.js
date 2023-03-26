const db = require("../models/polls");
const Polls = require("./poll");
const Embed = require("./embed");
async function checkPolls(client) {
    let polls = await db.find();
    if (!polls) return;
    let i = 0;
    for (let poll of polls) {
        i++
        setTimeout(async () => {
            const time = poll.now - (Date.now() - poll.time), users = poll.users, avatars = poll.avatars, votes = poll.votes, desc = poll.desc, names = poll.options, owner = poll.owner;
            const newPoll = new Polls({ time, client, name: { name: "Polls", description: desc }, options: names, votes: votes, users: users, avatars: avatars, owner: owner })
            await newPoll.update();

            const msg = await client.api.get(`/channels/${poll.channelId}/messages/${poll.messageId}`).then(d => client.messages.createObj(d, true)).catch(() => { return });
            if (msg) {
                msg.edit({ embeds: [new Embed().setMedia(await client.Uploader.upload(newPoll.canvas.toBuffer(), "Poll.png")).setColor("#A52F05")] }).catch(() => { });
                newPoll.start(msg, newPoll)
            }
            poll.delete();
        }, i * 700);
    }
}

module.exports = checkPolls;