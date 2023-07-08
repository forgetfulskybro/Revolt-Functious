const db = require("../models/guilds");
async function checkRoles(client) {
    let rr = await db.find({ $expr: { $gt: [{ $size: "$roles" }, 0] } });
    if (!rr || rr.length === 0) return;
    let i = 0;
    let ii = 0;
    for (let r of rr) {
        i++
        setTimeout(async () => {
            r.roles.map((role) => {
                ii++
                setTimeout(async () => {
                    await client.channels.get(role.chanId).fetchMessage(role.msgId).catch(() => { });
                }, ii * 700);
            });
        }, i * 600);
    }
}

module.exports = checkRoles;