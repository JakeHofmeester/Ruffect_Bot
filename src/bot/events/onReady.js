module.exports = function(member) {
    const bot = this.user.tag;
    const users = this.users.cache.size;
    const channels = this.channels.cache.size;
    const guilds = this.guilds.cache.size;

    return console.log(`Discord client logged in as ${bot} (${users} users, ${channels} channels, ${guilds} guilds)`);
};