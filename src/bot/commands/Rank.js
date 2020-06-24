const { Discord, Canvas, request } = require("../../utils/Imports");
const {
  ranks,
  validPlatforms,
} = require("../../files/rocket_league/rocket_league.json");
module.exports = {
  name: "RANK",
  execute: Rank,
};
async function Rank(msg, args) {
  if (msg.channel.id != global.gConfig.rank_channel) return; // checks for the rank channel
  const platform =
    args && args.length > 0 ? await args.shift().toLowerCase() : "xbox";
  if (!validPlatforms.find((pf) => pf === platform))
    return await msg.channel.send(
      `That is not a valid platform! Choose from: ${validPlatforms.join(", ")}`
    );
  let userId = await args.join("-");
  userId = !userId
    ? "Ruffect"
    : platform === "steam"
    ? await getValidId(userId)
    : userId;
  if (userId === null)
    return await msg.channel.send("That user doesn't exist!");
  const userData = await getUserData({ msg, userId, platform });
  if (userData === null)
    return await msg.channel.send(
      "Too many requests on our API, Try again later :("
    );
  const { rankData, profileData } = userData;
  return await sendRankData({ msg, args, rankData, profileData });
}
async function getValidId(userId) {
  for await (let val of userId) {
    if (isNaN(val)) return await getIdFromUrl(userId);
  }
  return userId;
  async function getIdFromUrl(urlName) {
    const url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_KEY}&vanityurl=${urlName}`;
    const jUser = await getData(url, { json: true });
    if (jUser.response.success != 1) return null;
    return jUser.response.steamid;
  }
}
async function getUserData({ msg, userId, platform }) {
  const steamCheckUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_KEY}&steamids=${userId}`;
  const rankData = await getRankData({ msg, userId, platform });
  if (rankData == null) return null;
  let profileData;
  switch (platform) {
    case "steam":
      const profileJson = await getData(steamCheckUrl, { json: true });
      if (
        !profileJson ||
        !profileJson.response ||
        !profileJson.response.players ||
        !profileJson.response.players[0]
      )
        return null;
      const playerJson = profileJson.response.players[0];
      profileData = {
        steamId: playerJson.steamid,
        name: playerJson.personaname,
        avatarUrl: playerJson.avatarfull,
        url: playerJson.profileurl,
      };
      break;
    case "ps":
      profileData = {
        name: userId,
        avatarUrl: "./src/files/rocket_league/psy.png",
      };
      break;
    case "xbox":
      profileData = {
        name: userId.replace(/-/g, " "),
        avatarUrl: `./src/files/rocket_league/${
          userId == "Ruffect" ? "ruffect_avatar" : "xbox"
        }.png`,
      };
      break;
    default:
      break;
  }
  return { rankData, profileData };
}
async function getRankData({ msg, userId, platform }) {
  const selectedAPI = {
    steam: async (userId) => await kyuuAPI(userId, "steam"),
    ps: async (userId) => await kyuuAPI(userId, "ps"),
    xbox: async (userId) => await kyuuAPI(userId, "xbox"),
  }[platform];
  if (!selectedAPI) {
    msg.channel.send(
      "Whoops something went wrong... Don't blame yourself it was me who did it :("
    );
    return `[ERROR]: False platform!`.sendLog();
  }
  const rankData = await selectedAPI(userId);
  if (!rankData || rankData == null || rankData == {} || !rankData["1v1"])
    return null;
  return rankData;
  async function kyuuAPI(id, platform) {
    try {
      const url = `https://kyuu.moe/extra/rankapi.php?channel=lilBunane&user=${id}&plat=${platform}`;
      const data = await getData(url, { json: false });
      if (!data || data === "") return null;
      const dataArray = await data.split(" | ");
      await dataArray.shift();
      const dataJSON = { api: "kyuu.moe" };
      for await (let i of dataArray) {
        let rankArr = await i.split(": ");
        const mode = await rankArr.shift().toLowerCase();
        rankArr = await rankArr.shift().split(" (");
        const name = await rankArr.shift().toLowerCase();
        const mmr = parseInt(await rankArr.shift().replace(")", ""));
        let rank = null;
        for (let r in ranks) {
          if (ranks[r].name === name) {
            rank = parseInt(r);
            break;
          }
        }
        if (rank === null) return null;
        dataJSON[mode] = { rank, mmr };
      }
      return dataJSON;
    } catch (error) {
      return null;
    }
  }
}
async function sendRankData({ msg, rankData, profileData }) {
  if (!rankData)
    return msg.channel.send(
      "Whoops something went wrong... Missing rank data... :("
    );
  if (!profileData)
    return msg.channel.send(
      "Whoops something went wrong... Missing profile data... :("
    );
  const imageBuffer = await createImage({ msg, rankData, profileData });
  const imageAttachment = new Discord.MessageAttachment(
    imageBuffer,
    "rank.png"
  );
  const eRanks = new Discord.MessageEmbed()
    .setColor("#2d51c9")
    .setTitle(`**${profileData.name.toUpperCase()}'S RANKS**`)
    .setImage("attachment://rank.png");
  if (profileData.url) eRanks.setURL(profileData.url);
  return await msg.channel.send({ files: [imageAttachment], embed: eRanks });
}
async function createImage({ msg, rankData, profileData }) {
  const iCard = await Canvas.loadImage("./src/files/rocket_league/card.png");
  const canvas = Canvas.createCanvas(iCard.width, iCard.height);
  const ctx = canvas.getContext("2d");
  const avatarImage = await Canvas.loadImage(profileData.avatarUrl);
  ctx.drawImage(avatarImage, 74, 74, 256, 256);
  ctx.drawImage(iCard, 0, 0);
  const rows = [
    ["1v1", "2v2", "3v3", "solo 3v3"],
    ["rumble", "dropshot", "hoops", "snowday"],
  ];
  let maxRank = 0;
  ctx.font = "bold 20px arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#dddddd";
  const rankImages = {};
  for (let i = 0; i < rows.length; i++) {
    const selectedRow = rows[i];
    for (let j = 0; j < selectedRow.length; j++) {
      const element = selectedRow[j];
      const elementData = rankData[element];
      if (elementData && !isNaN(elementData.rank)) {
        if (!rankImages[elementData.rank]) {
          rankImages[elementData.rank] = await Canvas.loadImage(
            `./src/files/rocket_league/rank_icons/${elementData.rank}.png`
          );
        }
        ctx.drawImage(
          rankImages[elementData.rank],
          458 + 224 * j,
          114 + 257 * i,
          160,
          136
        );
        ctx.fillText(elementData.mmr, 458 + 80 + 224 * j, 114 + 161 + 257 * i);
        if (elementData.rank >= maxRank) maxRank = elementData.rank;
      }
    }
  }
  const today = new Date();
  const dateString =
    ("0" + today.getDate()).slice(-2) +
    "." +
    ("0" + (today.getMonth() + 1)).slice(-2) +
    "." +
    today.getFullYear();
  ctx.textAlign = "right";
  ctx.font = "bold 15px arial";
  ctx.fillText(dateString, canvas.width - 15, 50);
  ctx.textAlign = "left";
  ctx.font = "bold 40px arial";
  ctx.fillText(profileData.name, 40, canvas.height - 40);
  return canvas.toBuffer();
}
function getData(url, { json, headers }) {
  return new Promise(function (resolve, reject) {
    request(
      {
        headers: headers ? headers : {},
        uri: url,
        method: "GET",
        json: json ? json : true,
      },
      function (error, res, body) {
        if (!error && res.statusCode === 200) resolve(body);
        else reject(error);
      }
    );
  });
}
