const { inspect } = require('util');
module.exports = {
	config: {
		name: "eval",
		description: "Evaluates code",
		usage: `<input>`,
		cooldown: 0,
		permissions: [],
		available: "Owner",
		aliases: ["e"]
	},
	run: async (client, message, args) => {
		if (!client.config.owners.includes(message.author._id)) return;
		try {
			let codein = args.join(" ");
			if (!args[0]) return message.reply("Send me code.")
			if (codein === 'client.session' || codein === 'client.api.authentication' || codein === 'client.api.authentication.revolt') {
				return message.reply(`\`\`\`js\nundefined`)
			};

			let code = await eval(codein);
			if (typeof code !== 'string') {
				if (code && typeof code.session === 'string') code.session = null;
				code = inspect(code, { depth: 0 });
			} 
			message.reply(`\`\`\`js\n${code}`).catch((e) => {
				message.reply(`\`\`\`js\n${e.message}\n\`\`\``);
			});
		} catch (e) {
			message.reply(`\`\`\`js\n${e ? e.message : "Unknown Error"}`);
		}

	}
}