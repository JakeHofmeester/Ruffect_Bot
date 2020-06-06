const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const client = new Discord.Client();

client.on("message", (message) => {
  if (message.content === `${prefix}ping`) {
    message.channel.send("Pong.");
  } else if (message.content === `${prefix}beep`) {
    message.channel.send("Boop.");
  } else if (message.content === `${prefix}user-info`) {
    message.channel.send(
      `Your username: ${message.author.username}\nYour ID: ${message.author.id}`
    );
  } else if (message.content === `${prefix}server-info`) {
    message.channel.send(
      `Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`
    );
  }
});

// THIS  MUST  BE  THIS  WAY

client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret
