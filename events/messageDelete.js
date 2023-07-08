const PollDB = require("../models/polls");
const Giveaways = require("../models/giveaways");
const GuildDB = require("../models/guilds");
module.exports = async (client, msg) => {
    const paginateCheck = client.paginate.get(msg.authorId);
    const pollCheck = client.polls.get(msg.id);
    if (paginateCheck) {
        client.paginate.delete(msg.authorId);
    } else if (pollCheck) {
        client.polls.delete(msg.id);
        await PollDB.findOneAndDelete({ messageId: msg.id });
    } else {
        const db = await Giveaways.findOne({ messageId: msg.id });
        if (db) {
            await db.updateOne({ ended: true, endDate: Date.now() })
            await db.save();
        } else {
            const db2 = await GuildDB.findOne({ "roles": { $elemMatch: { msgId: msg.id } } });
            if (db2) {
                db2.roles = db2.roles.filter(e => e.msgId !== msg.id);
                await db2.save();
            }
        }
    }
}