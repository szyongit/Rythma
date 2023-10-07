"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const databasehandler_1 = __importDefault(require("./handler/databasehandler"));
const commandhandler_1 = __importDefault(require("./handler/commandhandler"));
const componenthandler_1 = __importDefault(require("./handler/componenthandler"));
(0, dotenv_1.config)({ path: '../.env' });
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const DISCORD_BOT_CLIENT_ID = process.env.DISCORD_BOT_CLIENT_ID || "";
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || "";
const rest = new discord_js_1.REST().setToken(DISCORD_BOT_TOKEN);
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildVoiceStates
    ]
});
async function main() {
    console.log("Connecting to database...");
    await databasehandler_1.default.connectToDB()
        .then(() => console.log("Connected to database!"))
        .catch(() => {
        console.log("Could not connect to database!");
        process.exit();
    });
    console.log();
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(discord_js_1.Routes.applicationCommands(DISCORD_BOT_CLIENT_ID) /*applicationGuildCommands(DISCORD_BOT_CLIENT_ID, DISCORD_GUILD_ID)*/, {
            body: commandhandler_1.default.jsonFormat
        });
        console.log('Logging in...');
        client.login(DISCORD_BOT_TOKEN);
    }
    catch (err) {
        console.log(err);
    }
    ;
}
let presenceState;
async function updatePresence() {
    presenceState = 0;
    setInterval(() => {
        if (presenceState == 0) {
            const serverCount = client.guilds.cache.size;
            client.user?.setPresence({
                status: 'online',
                activities: [{ name: `on ${serverCount} servers.`, type: discord_js_1.ActivityType.Playing }],
            });
            presenceState = 1;
            return;
        }
        if (presenceState == 1) {
            client.user?.setPresence({
                status: 'online',
                activities: [{ name: 'ilovemusic.de', type: discord_js_1.ActivityType.Listening }],
            });
            presenceState = 0;
            return;
        }
    }, 12000);
}
client.on('ready', (client) => {
    console.log(`\x1b[32m${client.user.tag} is now running!\x1b[0m\n`);
    updatePresence();
});
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        commandhandler_1.default.handle(client, interaction);
    }
    else {
        componenthandler_1.default.handle(client, interaction);
    }
});
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.member?.user == client.user)
        return;
    if (!newState.channel?.members.has(client.user?.id || ""))
        return;
    //deaf
    if (newState.deaf) {
        saveListeningTime(oldState, newState);
        return;
    }
    //listening
    if (!newState.deaf) {
        saveJoinTime(oldState, newState);
        return;
    }
    //User joins the channel
    if (!oldState.channel && newState.channel && !newState.deaf) {
        await saveJoinTime(oldState, newState);
        return;
    }
    //User leaves the channel
    if (oldState.channel && !newState.channel) {
        await saveListeningTime(oldState, newState);
        return;
    }
});
async function saveJoinTime(oldState, newState) {
    const doc = await databasehandler_1.default.PlayTime.findOne({ guild: newState.guild.id, "users.id": newState.member?.id }).exec();
    if (!doc) {
        await databasehandler_1.default.PlayTime.updateOne({ guild: newState.guild.id }, { $push: { users: { id: newState.member?.id, joinTime: Date.now() } } }, { upsert: true }).exec();
        return;
    }
    await databasehandler_1.default.PlayTime.updateOne({ guild: newState.guild.id, "users.id": `${newState.member?.id}` }, { $set: { "users.$.joinTime": Date.now() } }).exec();
}
async function saveListeningTime(oldState, newState) {
    const doc = await databasehandler_1.default.PlayTime.findOne({ guild: oldState.guild.id, "users.id": `${newState.member?.id}` }).exec();
    if (!doc)
        return;
    const userDatas = doc.users.filter((element) => element.id == oldState.member?.id);
    if (userDatas.length < 1)
        return;
    const userData = userDatas[0];
    const joinTime = userData.joinTime;
    const now = Date.now();
    const listeningTime = (doc.time || 0) + (now - (joinTime || now));
    await databasehandler_1.default.PlayTime.updateOne({ guild: newState.guild.id, "users.id": `${newState.member?.id}` }, { $set: { "users.$.time": listeningTime }, $unset: { "users.$.joinTime": "" } }, { upsert: true }).exec();
}
main();
