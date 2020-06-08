module.exports = function(msg) {
    // Checks if the message came from a bot and if it did it doesn't proceed
    if(msg.author.bot) return;
    // Checks if the message has the prefix and if it did it executes "executeCommand"
    else if(msg.content.startsWith(process.env.PREFIX)) return executeCommand(this, msg);
};

function executeCommand(client, msg) {
    // Removes the prefix from the message and creates an array of arguments
    const args = msg.content.slice(process.env.PREFIX.length).split(/ +/);
    // First argument is the command name so it takes it out from the "args"
    const command = args.shift().toUpperCase();
    // Check if the collection has a command by that name if it doesn't it stops the execution
    if(!client.commands.has(command)) return;
    try {
        // Fetches the command from the collection and calls the "execute" function in the command
        return client.commands.get(command).execute(msg, args);
    } catch (error) { console.log(error); }
}