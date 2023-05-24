const { readdirSync } = require("fs")
module.exports = (client) => {
    const events = readdirSync(`./events/`).filter(d => d.endsWith('.js'));
    for (let file of events) {
        let evt = require(`../events/${file}`);
        client.event.set(file.split(".")[0], evt.bind(null, client));
        client.on(file.split('.')[0], evt.bind(null, client));
    };
}; 