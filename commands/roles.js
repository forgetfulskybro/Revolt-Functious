const Embed = require("../functions/embed")
const regex = /^<#(?<id>[A-Z0-9]+)>/;
const pick = ["content", "embed"];
const Paginator = require("../functions/pagination");
module.exports = {
    config: {
        name: "roles",
        usage: true,
        cooldown: 7000,
        available: true,
        permissions: ["ManageServer"],
        aliases: ["reactionroles", "reactions", "reactroles", "reactionrole"],
    },
    run: async (client, message, args, db) => {
        if (!message.channel.havePermission("AssignRoles")) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.noPerms")}`).setColor(`#FF0000`)] }, false);

        if (args.filter(e => e).length === 0 || args[0].toLowerCase() === "help") {
            const embed = new Embed()
                .setColor(`#A52F05`)
                .setDescription(`### ${client.translate.get(db.language, "Commands.roles.view")} ${client.translate.get(db.language, "Commands.roles.usage").replace("h", "H")}\n\n**${client.translate.get(db.language, "Commands.roles.create")}**\n\`${db.prefix}roles ${client.translate.get(db.language, "Commands.roles.createExample")}\`\n\n**${client.translate.get(db.language, "Commands.roles.viewing")}**\n\`${db.prefix}roles view\`\n\n**${client.translate.get(db.language, "Commands.roles.deleting")}**\n\`${db.prefix}roles delete [${client.translate.get(db.language, "Commands.roles.msgId")} ID, e.g. ${message.id}]\``)
            
            setTimeout(() => client.used.delete(`${message.authorId}-roles`), 6000)
            return message.reply({ embeds: [embed] }, false)
        } else if (args[0]?.toLowerCase() === "view") {
            if (db.roles.length === 0) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.noRoles")}: \`${db.prefix}roles\``).setColor(`#FF0000`)] }, false);
            const pages = new Paginator({ timeout: 5 * 2e4, user: message.authorId, client: client })
            let data;
            data = db.roles.map((msg, i) => `**ID**: ${msg.msgId}\n**${client.translate.get(db.language, "Commands.roles.roles")}**: ${msg.roles.length}\n[${client.translate.get(db.language, "Commands.roles.jump")}](https://app.revolt.chat/server/${message.server.id}/channel/${msg.chanId}/${msg.msgId})`);
            data = Array.from({ length: Math.ceil(data.length / 3) }, (a, r) => data.slice(r * 3, r * 3 + 3));
            Math.ceil(data.length / 3);
            data = data.map(e => pages.add(new Embed().setDescription(`## ${client.translate.get(db.language, "Commands.roles.view")}\n\n${e.slice(0, 3).join("\n\n")}`).setColor("#A52F05")))
            
            setTimeout(() => client.used.delete(`${message.authorId}-roles`), 6000)
            return pages.start(message.channel);
        } else if (args[0]?.toLowerCase() === "delete") {
            if (db.roles.length === 0) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.noRoles")}: \`${db.prefix}roles\``).setColor(`#FF0000`)] }, false);
            if (!args[1]) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.delete")}: \`${db.prefix}roles delete <messageId>\``).setColor(`#FF0000`)] }, false);

            const msg = db.roles.find(e => e.msgId === args[1]);
            if (!msg) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.notFound")}`).setColor(`#FF0000`)] }, false);

            await client.messages?.get(msg.msgId)?.delete().catch(() => { });
            await client.database.updateGuild(message.server.id, { roles: db.roles.filter(e => e.msgId !== args[1]) });
            
            setTimeout(() => client.used.delete(`${message.authorId}-roles`), 6000)
            return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.deleted")}`).setColor(`#A52F05`)] }, false);
        } else if (args[0]?.toLowerCase() === "dms" || args[0]?.toLowerCase() === "dm") {
            const dms = db.dm;
            await client.database.updateGuild(message.server.id, { dm: !dms });
            
            setTimeout(() => client.used.delete(`${message.authorId}-roles`), 6000)
            return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.dms")} **${dms ? client.translate.get(db.language, "Commands.roles.off") : client.translate.get(db.language, "Commands.roles.on")}**`).setColor(`#A52F05`)] }, false);
        } else if (args[0]?.toLowerCase() === "create") {
            if (client.messageCollector.has(message.author.id)) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.already")}`).setColor(`#FF0000`)] }, false);
            if (db.roles.length > 12) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.max")}`).setColor(`#FF0000`)] }, false);

            let channel = message.channel;
            let content = args.slice(1).join(" ");

            if (regex.test(content)) {
                channel = message.server.channels.find(e => e.id === content.match(regex).groups.id);

                if (!channel) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.validChannel")}: \`${client.config.prefix}roles (content OR embed) <#${channel.id}>\``).setColor(`#FF0000`)] });
                if (!channel.havePermission("SendMessage")) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.noperms")} (content OR embed) <#${channel.id}>`).setColor(`#FF0000`)] }, false);
                if (!channel.havePermission("ViewChannel")) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.noperms2")} (content OR embed) <#${channel.id}>`).setColor(`#FF0000`)] });
                if (!channel.havePermission("React")) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.giveaway.noperms3")} (content OR embed) <#${channel.id}>`).setColor(`#FF0000`)] }, false);
            }

            const picked = pick.map(e => content.includes(e));
            if (picked.filter(e => e).length === 2) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.pick")}\n\n${client.translate.get(db.language, "Commands.language.example")}: ${client.config.prefix}roles content <#${channel.id}>\n${client.translate.get(db.language, "Commands.language.example")}: ${client.config.prefix}roles embed <#${channel.id}>`).setColor(`#FF0000`)] }, false);

            const coll = await client.messageCollector.set(message.authorId, {
                user: message.authorId,
                timeout: null,
                messageId: null,
                channelId: channel.id,
                type: pick[picked.indexOf(true)] || "content",
                rolesDone: [],
                roles: [],
                regex: [],
            });

            const timeout = setTimeout(async () => {
                if (!client.messageCollector.has(coll.user)) return;
                const ended = new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.ended")}`).setColor(`#FF0000`);
                await client.api.patch(`/channels/${client.messageCollector.get(coll.user).channelId}/messages/${client.messageCollector.get(user).messageId}`, { "embeds": [ended] }).catch(() => { });
                client.messageCollector.delete(coll.user);
            }, 1500000);
            client.messageCollector.get(message.author.id).timeout = timeout;

            setTimeout(() => client.used.delete(`${message.authorId}-roles`), 6000)
            if (channel.id !== message.channel.id) {
                message.reply(`${client.translate.get(db.language, "Commands.roles.success")} <#${channel.id}>`, false);
                return channel.sendMessage({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.react")}\n\n${client.translate.get(db.language, "Commands.roles.react2")}`).setColor(`#A52F05`)] });
            } else {
                return message.channel.sendMessage({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.react")}\n\n${client.translate.get(db.language, "Commands.roles.react2")}`).setColor(`#A52F05`)] });
            }
        }
    }
};
