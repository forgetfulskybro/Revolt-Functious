const { readdirSync } = require("fs")
const color = require("../functions/colorCodes")
module.exports = (client) => {
  const commands = readdirSync(`./commands/`).filter(d => d.endsWith('.js'));
    for (let file of commands) {
      let pull = require(`../commands/${file}`);
      client.commands.set(pull.config.name, pull);
      if (pull.config.aliases) pull.config.aliases.forEach(a => client.aliases.set(a, pull.config.name));
  };

  console.log(color("%", `%b[Command_Handler]%7 :: Loaded %e${client.commands.size} %7commands`));
}