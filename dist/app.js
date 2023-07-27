"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const commandhandler_1 = __importDefault(require("./handler/commandhandler"));
const componenthandler_1 = __importDefault(require("./handler/componenthandler"));
(0, dotenv_1.config)({ path: '../.env' });
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const DISCORD_BOT_CLIENT_ID = process.env.DISCORD_BOT_CLIENT_ID || "";
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || "";
const DATABASE_URI = process.env.DATABASE_URI || "";
const rest = new discord_js_1.REST().setToken(DISCORD_BOT_TOKEN);
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildVoiceStates
    ]
});
async function main() {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(discord_js_1.Routes.applicationGuildCommands(DISCORD_BOT_CLIENT_ID, DISCORD_GUILD_ID), {
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
client.on('ready', (client) => {
    console.log(`\x1b[32m${client.user.tag} is now running!\x1b[0m\n`);
});
client.on('interactionCreate', async (interaction) => {
    commandhandler_1.default.handle(client, interaction);
    componenthandler_1.default.handle(client, interaction);
});
main();
