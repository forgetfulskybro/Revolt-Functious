const { readdirSync } = require("fs")
module.exports = (client) => {
    const load = dirs => {
        const events = readdirSync(`./events/${dirs}/`).filter(d => d.endsWith('.js'));
        for (let file of events) {
            let evt = require(`../events/${dirs}/${file}`);
            client.events.set(file.split(".")[0], evt.bind(null, client));
            client.on(file.split('.')[0].replace(/([A-Z])/g, '/$1').toLowerCase(), evt.bind(null, client));
        };
    };
    ["client", "guild"].forEach(x => load(x));
}; 