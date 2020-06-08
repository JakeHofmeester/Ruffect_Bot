const { Discord, fs, YAML } = require("./src/utils/Imports");

require("dotenv").config({ path: "./src/config/.env" });
global.gConfig = YAML.parse(
  fs.readFileSync("./src/config/config.yaml", "utf8")
);

// Creates new Client
const client = new Discord.Client();

// Imports and assigns the functions to an event
client.on("ready", require("./src/bot/events/onReady"));
client.on("message", require("./src/bot/events/onMessage"));
client.on("guildMemberAdd", require("./src/bot/events/onGuildMemberAdd"));

// Creates a new Collection for commands
client.commands = new Discord.Collection();

// Finds all JavaScript files in "./src/bot/commands"
const commandFiles = fs
  .readdirSync("./src/bot/commands")
  .filter((file) => file.endsWith(".js"));
// Loops trough all the file names and imports the code
for (const file of commandFiles) {
  const command = require(`./src/bot/commands/${file}`);
  // Appends a new command to the Collection
  client.commands.set(command.name.toUpperCase(), command);
}

// Bot login
client.login(process.env.BOT_TOKEN);
