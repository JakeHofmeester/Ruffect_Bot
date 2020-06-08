/**
 * This is a basic command layout
 * You export command name the function that will be executed when the command is called
 * in this case it will call @function Example
 */
module.exports = {
  name: "Example",
  execute: Example,
};

function Example(msg, args) {
  return msg.channel.send(`Hello! ${args.join(", ")}`);
}
