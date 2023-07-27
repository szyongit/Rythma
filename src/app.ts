import { Client, REST, GatewayIntentBits, Routes } from 'discord.js';
import { config } from 'dotenv';

import Commandhandler from './handler/commandhandler';
import ComponentHandler from './handler/componenthandler';

config({path:'../.env'});

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const DISCORD_BOT_CLIENT_ID = process.env.DISCORD_BOT_CLIENT_ID || "";
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || "";
const DATABASE_URI = process.env.DATABASE_URI || "";

const rest = new REST().setToken(DISCORD_BOT_TOKEN);
const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
});

async function main() {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationGuildCommands(DISCORD_BOT_CLIENT_ID, DISCORD_GUILD_ID), {
            body: Commandhandler.jsonFormat
        });
    
        console.log('Logging in...');
        client.login(DISCORD_BOT_TOKEN);
    } catch(err) {
        console.log(err);
    };
}

client.on('ready', (client) => {
    console.log(`\x1b[32m${client.user.tag} is now running!\x1b[0m\n`)
});
client.on('interactionCreate', async (interaction) => {
    Commandhandler.handle(client, interaction);
    ComponentHandler.handle(client, interaction);
});

main();