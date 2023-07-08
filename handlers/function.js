const { readdirSync } = require("fs")
const color = require("../functions/colorCodes")
module.exports = (client) => {
  const functions = readdirSync(`./functions`).filter(d => d.endsWith('.js'));
  for (let file of functions) {
    let evt = require(`../functions/${file}`);
    client.functions.set(file.split(".")[0], evt);
  };

  console.log(color("%", `%b[Function_Handler]%7 :: Loaded %e${client.functions.size} %7functions`));
}; 