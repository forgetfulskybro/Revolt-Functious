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

        switch (args[0]?.toLowerCase()) {
            default: "help"
            case "help":
                const embed = new Embed()
                    .setColor(`#A52F05`)
                    .setDescription(`### ${client.translate.get(db.language, "Commands.roles.view")} ${client.translate.get(db.language, "Commands.roles.usage").replace("h", "H")}\n\n**${client.translate.get(db.language, "Commands.roles.explain")}**\n${client.translate.get(db.language, "Commands.roles.explain2")}\n\n**${client.translate.get(db.language, "Commands.roles.create")}**\n\`${db.prefix}roles ${client.translate.get(db.language, "Commands.roles.createExample")}\`\n\n**${client.translate.get(db.language, "Commands.roles.editing")}**\n\`${db.prefix}roles edit [${client.translate.get(db.language, "Commands.roles.msgId")} ID, e.g. ${message.id}]\`\n\n**${client.translate.get(db.language, "Commands.roles.viewing")}**\n\`${db.prefix}roles view\`\n\n**${client.translate.get(db.language, "Commands.roles.deleting")}**\n\`${db.prefix}roles delete [${client.translate.get(db.language, "Commands.roles.msgId")} ID, e.g. ${message.id}]\`\n\n**${client.translate.get(db.language, "Commands.roles.dm")}**\n\`${db.prefix}roles dm\``)

                setTimeout(() => client.used.delete(`${message.authorId}-roles`), 6000)
                message.reply({ embeds: [embed] }, false)
                break;

            case "view":
                if (db.roles.length === 0) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.noRoles")}: \`${db.prefix}roles\``).setColor(`#FF0000`)] }, false);
                const pages = new Paginator({ timeout: 5 * 2e4, user: message.authorId, client: client })
                let data;
                data = db.roles.map((msg, i) => `**ID**: ${msg.msgId}\n**${client.translate.get(db.language, "Commands.roles.roles")}**: ${msg.roles.length}\n[${client.translate.get(db.language, "Commands.roles.jump")}](https://app.revolt.chat/server/${message.server.id}/channel/${msg.chanId}/${msg.msgId})`);
                data = Array.from({ length: Math.ceil(data.length / 3) }, (a, r) => data.slice(r * 3, r * 3 + 3));
                Math.ceil(data.length / 3);
                data = data.map(e => pages.add(new Embed().setDescription(`## ${client.translate.get(db.language, "Commands.roles.view")}\n\n${e.slice(0, 3).join("\n\n")}`).setColor("#A52F05")))
            
                setTimeout(() => client.used.delete(`${message.authorId}-roles`), 6000)
                pages.start(message.channel);
                break;

            case "delete":
                if (db.roles.length === 0) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.noRoles")}: \`${db.prefix}roles\``).setColor(`#FF0000`)] }, false);
                if (!args[1]) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.delete")}: \`${db.prefix}roles delete <messageId>\``).setColor(`#FF0000`)] }, false);

                const msg = db.roles.find(e => e.msgId === args[1]);
                if (!msg) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.notFound")}`).setColor(`#FF0000`)] }, false);

                await client.messages?.get(msg.msgId)?.delete().catch(() => { });
                await client.database.updateGuild(message.server.id, { roles: db.roles.filter(e => e.msgId !== args[1]) });
            
                setTimeout(() => client.used.delete(`${message.authorId}-roles`), 6000)
                message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.deleted")}`).setColor(`#A52F05`)] }, false);
                break;

            case "dm", "dms":
                const dms = db.dm;
                await client.database.updateGuild(message.server.id, { dm: !dms });
            
                setTimeout(() => client.used.delete(`${message.authorId}-roles`), 6000)
                message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.dms")} **${dms ? client.translate.get(db.language, "Commands.roles.off") : client.translate.get(db.language, "Commands.roles.on")}**`).setColor(`#A52F05`)] }, false);
                break;

            case "edit":
                if (client.messageCollector.has(message.author.id) || client.messageEdit.has(message.author.id)) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.already")}`).setColor(`#FF0000`)] }, false);
                if (db.roles.length === 0) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.noRoles")}: \`${db.prefix}roles\``).setColor(`#FF0000`)] }, false);
                if (!args[1]) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.edit")}: \`${db.prefix}roles edit <messageId>\``).setColor(`#FF0000`)] }, false);

                const editmsg = db.roles.find(e => e.msgId === args[1]);
                if (!editmsg) return message.reply({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.notFound")}`).setColor(`#FF0000`)] }, false);

                let type;
                const fetched = client.messages.get(args[1]);
                if (fetched.content) type = "content"
                else type = "embed"

                let arr = [];
                let startText = fetched.content;
                let text = fetched.content.match(/\:([^}]*)\:( )\$\\text{([^}]*)}{([^}]*)}}\$/g);
                text.map(e => arr.push(e.match(/}{([^}]*)}}\$/)[1]))

                text.map((e, i=0) => {
                    startText = startText.replace(e, `{role:${arr[i]}}`)
                    i++;
                })

                const editcoll = await client.messageEdit.set(message.authorId, {
                    user: message.authorId,
                    timeout: null,
                    oldMessageId: fetched.id,
                    botMessage: null,
                    messageId: null,
                    channelId: editmsg.chanId,
                    type: type,
                    rolesDone: [],
                    roles: [],
                    regex: [],
                });

                const edittimeout = setTimeout(async () => {
                    if (!client.messageEdit.has(editcoll.user)) return;
                    const ended = new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.ended")}`).setColor(`#FF0000`);
                    await client.api.patch(`/channels/${client.messageEdit.get(editcoll.user).channelId}/messages/${client.messageEdit.get(editcoll.user).messageId}`, { "embeds": [ended] }).catch(() => { });
                    client.messageEdit.delete(editcoll.user);
                }, 1500000);
                client.messageEdit.get(message.author.id).timeout = edittimeout;

                const editreact = [client.config.emojis.cross]
                setTimeout(() => client.used.delete(`${message.authorId}-roles`), 6000)

                const editchan = message.server.channels.find(e => e.id === editmsg.chanId);
                if (editchan.id !== message.channel.id) {
                    message.reply(`${client.translate.get(db.language, "Commands.roles.success")} <#${editchan.id}>`, false);
                    await editchan.sendMessage({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.react")}\n\n${client.translate.get(db.language, "Commands.roles.react2")}\n\n\`\`\`txt\n${startText.replace(`\n\n##### ${client.translate.get(db.language, "Events.messageReactionAdd.cooldown")}`, "")}\n\`\`\``).setColor(`#A52F05`)], interactions: [editreact] })
                        .then((msg) => { client.messageEdit.get(message?.authorId).botMessage = msg.id });
                } else {
                    await message.channel.sendMessage({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.react")}\n\n${client.translate.get(db.language, "Commands.roles.react2")}\n\n\`\`\`txt\n${startText.replace(`\n\n##### ${client.translate.get(db.language, "Events.messageReactionAdd.cooldown")}`, "")}\n\`\`\``).setColor(`#A52F05`)], interactions: [editreact] })
                        .then((msg) => { client.messageEdit.get(message?.authorId).botMessage = msg.id });
                }
                break;

            case "create":
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
                    oldMessageId: null,
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
                    await client.api.patch(`/channels/${client.messageCollector.get(coll.user).channelId}/messages/${client.messageCollector.get(coll.user).messageId}`, { "embeds": [ended] }).catch(() => { });
                    client.messageCollector.delete(coll.user);
                }, 1500000);
                client.messageCollector.get(message.author.id).timeout = timeout;

                const react = [client.config.emojis.cross]
                setTimeout(() => client.used.delete(`${message.authorId}-roles`), 6000)
                if (channel.id !== message.channel.id) {
                    message.reply(`${client.translate.get(db.language, "Commands.roles.success")} <#${channel.id}>`, false);
                    await channel.sendMessage({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.react")}\n\n${client.translate.get(db.language, "Commands.roles.react2")}`).setColor(`#A52F05`)], interactions: [react] })
                        .then((msg) => { client.messageCollector.get(message?.authorId).oldMessageId = msg.id });
                } else {
                    await message.channel.sendMessage({ embeds: [new Embed().setDescription(`${client.translate.get(db.language, "Commands.roles.react")}\n\n${client.translate.get(db.language, "Commands.roles.react2")}`).setColor(`#A52F05`)], interactions: [react] })
                        .then((msg) => { client.messageCollector.get(message?.authorId).oldMessageId = msg.id });
                }
                break;
        }
    }
};
