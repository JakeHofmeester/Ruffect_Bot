module.exports = function (member) {
  member.guild.channels.cache
    .get("701860346897498113")
    .send(`Hey ${member}, welcome to **Ruffect's Server**! `);

  member.roles.add(global.gConfig.default_role);
};
