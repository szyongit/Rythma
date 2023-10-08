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
const voicestatehandler_1 = __importDefault(require("./handler/voicestatehandler"));
const data_1 = __importDefault(require("./data"));
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
            presenceState = 2;
            return;
        }
        if (presenceState == 2) {
            const time = (client.uptime || 0) / 1000;
            let string = "";
            string = (((time) % 60).toFixed(0) + " seconds");
            if (time >= 60)
                string = (((time / 60) % 60).toFixed(0) + " minutes");
            if (time >= 60 * 60)
                string = (((time / 60 / 60)).toFixed(1) + " hours");
            client.user?.setPresence({
                status: 'online',
                activities: [{ name: `online for ${string} now`, type: discord_js_1.ActivityType.Playing }],
            });
            presenceState = 3;
            return;
        }
    }, 12500);
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
    await voicestatehandler_1.default.handle(client, oldState, newState);
});
client.on('messageCreate', async (message) => {
    if (!data_1.default.getLockedChannel())
        return;
    if (message.author.id === client.user?.id)
        return;
    if (message.channel.id !== data_1.default.getLockedChannel())
        return;
    if (!message.deletable)
        return;
    message.delete();
});
main();
