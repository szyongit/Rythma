import { Client, REST, GatewayIntentBits, Routes, ActivityType, ReactionUserManager, ChannelType } from 'discord.js';
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
        await rest.put(Routes.applicationCommands(DISCORD_BOT_CLIENT_ID)/*applicationGuildCommands(DISCORD_BOT_CLIENT_ID, DISCORD_GUILD_ID)*/, {
            body: Commandhandler.jsonFormat
        });
    
        console.log('Logging in...');
        client.login(DISCORD_BOT_TOKEN);
    } catch(err) {
        console.log(err);
    };
}

let presenceState:number;
async function updatePresence() {
    presenceState = 0;

    setInterval(() => {
        if(presenceState == 0) {
            const serverCount = client.guilds.cache.size;
            client.user?.setPresence({
                status:'online',
                activities:[{name:`on ${serverCount} servers.`, type:ActivityType.Playing}],
            });
            presenceState = 1;
            return;
        }

        if(presenceState == 1) {
            client.user?.setPresence({
                status:'online',
                activities:[{name:'ilovemusic.de', type:ActivityType.Listening}],
            });
            presenceState = 0;
            return;
        }
        
    }, 12000);
}

client.on('ready', (client) => {
    console.log(`\x1b[32m${client.user.tag} is now running!\x1b[0m\n`)
    updatePresence();
});
client.on('interactionCreate', async (interaction) => {
    if(interaction.isChatInputCommand()) {
        Commandhandler.handle(client, interaction);
    } else {
        ComponentHandler.handle(client, interaction);
    }
});

main();