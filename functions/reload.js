function Reload(client, category, name, eventFolder) {
    if (category === "events") {
        if (!name) return 'Provide an event name to reload!'
        if (!eventFolder) return 'Provide an event folder to reload!'
        try {
            const evtName = name;
            delete require.cache[require.resolve(`../events/${eventFolder}/${name}.js`)];
            const pull = require(`../events/${eventFolder}/${name}`);

            client.off(evtName, typeof client._events[evtName] == 'function' ? client._events[evtName] : client._events[evtName][0])
            client.event.delete(evtName)

            client.on(evtName, pull.bind(null, client))
            client.event.set(evtName, pull.bind(null, client))
        } catch (e) {
            return `Couldn't reload: **${eventFolder}/${name}**\n**Error**: ${e.message}`
        }
        return `Reloaded event: **${name}**.js`
    }

    if (category === "functions") {
        if (!name) return 'Provide a function name to reload!'
        try { 
            const evtName = name;
            delete require.cache[require.resolve(`../functions/${name}.js`)];
            const pull = require(`../functions/${name}`);

            client.functions.delete(evtName)
            client.functions.set(evtName, pull)
        } catch (e) {
            return `Couldn't reload: **functions/${name}**\n**Error**: ${e.message}`
        }
        return `Reloaded function: **${name}**.js`
    }

    try {
        if (!category) return 'Provide a command name to reload!'
        delete require.cache[require.resolve(`../commands/${category}.js`)];
        const pull = require(`../commands/${category}.js`);
        if (client.commands.get(category).config.aliases) client.commands.get(category).config.aliases.forEach(a => client.aliases.delete(a));
        client.commands.delete(category);
        client.commands.set(category, pull);
        if (client.commands.get(category).config.aliases) client.commands.get(category).config.aliases.forEach(a => client.aliases.set(a, category));
        return `Reloaded command: **commands/${category}**.js`
    } catch (e) {
        return `Couldn't reload: **commands/${category}**\n**Error**: ${e.message}`
    }
}

module.exports = Reload;