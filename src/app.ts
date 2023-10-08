import { Client, REST, GatewayIntentBits, Routes, ActivityType, VoiceState } from 'discord.js';
import { config } from 'dotenv';

import DatabaseHandler from './handler/databasehandler';

import Commandhandler from './handler/commandhandler';
import ComponentHandler from './handler/componenthandler';
import VoiceStateHandler from './handler/voicestatehandler';

import Data from './data';

config({path:'../.env'});

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const DISCORD_BOT_CLIENT_ID = process.env.DISCORD_BOT_CLIENT_ID || "";
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || "";

const rest = new REST().setToken(DISCORD_BOT_TOKEN);
const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
});

async function main() {
    console.log("Connecting to database...");
    await DatabaseHandler.connectToDB()
    .then(() => console.log("Connected to database!"))
    .catch(() => {
        console.log("Could not connect to database!")
        process.exit();
    });

    console.log();

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
            presenceState = 2;
            return;
        }

        if(presenceState == 2) {
            const time:number = (client.uptime || 0) / 1000;
            let string = "";
            string = (((time)%60).toFixed(0) + " seconds");
            if(time >= 60) string = (((time/60)%60).toFixed(0) + " minutes");
            if(time >= 60*60) string = (((time/60/60)).toFixed(1) + " hours");

            client.user?.setPresence({
                status:'online',
                activities:[{name:`online for ${string} now`, type:ActivityType.Playing}],
            });
            presenceState = 3;
            return;
        }
        
    }, 12500);
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
client.on('voiceStateUpdate', async (oldState, newState) => {
    await VoiceStateHandler.handle(client, oldState, newState);
});
client.on('messageCreate', async (message) => {
    if(!Data.getLockedChannel()) return;
    if(message.author.id === client.user?.id) return;
    if(message.channel.id !== Data.getLockedChannel()) return;
    if(!message.deletable) return;

    message.delete();
})

main();