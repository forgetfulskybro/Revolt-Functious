const PollDB = require("../models/polls");
const Giveaways = require("../models/giveaways");
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
        if (!db) return;
        await db.updateOne({ ended: true, endDate: Date.now() })
        await db.save();
    }
}