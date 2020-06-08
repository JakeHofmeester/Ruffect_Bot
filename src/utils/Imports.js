/**
 * I prefer to have all npm modules in one place
 * The idea behind it is that you import them like this:
 * @example
 * const {
 *    Discord,
 *    request,
 *    fs
 * } = require("./Imports");
 */

module.exports = { 
    Discord: require("discord.js"),
    request: require("request"),
    fs: require("fs"),
    Canvas: require("canvas"),
    YAML: require("yaml")
}