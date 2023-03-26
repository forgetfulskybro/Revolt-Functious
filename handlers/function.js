const { readdirSync } = require("fs")
module.exports = (client) => {
  const functions = readdirSync(`./functions`).filter(d => d.endsWith('.js'));
  for (let file of functions) {
    let evt = require(`../functions/${file}`);
    client.functions.set(file.split(".")[0], evt);
  };
}; 