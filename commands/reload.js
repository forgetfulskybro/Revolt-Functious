const Reload = require("../functions/reload")
module.exports = {
    config: {
        name: "reload",
        cooldown: 0,
        available: "Owner",
        permissions: [],
        aliases: ["r"]
    },
    run: async (client, message, args) => {     
        if (!client.config.owners.includes(message.authorId)) return;
        if (!args[0]) return message.reply("Provide either a category or a command to reload.", false)
        if (args[0] === "category") {
            let error = [];
            let success = [];

            if (!args[1]) return message.reply("Provide a category's name to reload it.", false)

            client.commands.filter(c => c.config.category === args[1]).map(cc => {
                Reload(client, cc.config.category, cc.config.name, args[2])

                let check = client.reloadCommand(args[1], cc.config.name)
                if (check.includes("Error")) return error.push(check)
                else if (check.includes("Reloaded command:")) return success.push("1")
            })
 
            return message.reply(`\`\`\`css\nSuccessful Commands: ${success.length}\nErrored Commands: ${error.length} ${error.length > 0 ? "\n" + error.map(c => c).join("\n") : " "}`, false)
        }
        message.reply(Reload(client, args[0], args[1], args[2]), false)
    }
}