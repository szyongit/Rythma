import { Client, REST, GatewayIntentBits, Routes, ActivityType, VoiceState } from 'discord.js';
import { config } from 'dotenv';

import DatabaseHandler from './handler/databasehandler';

import Commandhandler from './handler/commandhandler';
import ComponentHandler from './handler/componenthandler';

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

client.on('voiceStateUpdate', async (oldState, newState) => {
    if(newState.member?.user == client.user) return;
    if(!newState.channel?.members.has(client.user?.id || "")) return;

    //deaf
    if(newState.deaf) {
        saveListeningTime(oldState, newState);
        return;
    }

    //listening
    if(!newState.deaf) {
        saveJoinTime(oldState, newState);
        return;
    }

    //User joins the channel
    if(!oldState.channel && newState.channel && !newState.deaf) {
        await saveJoinTime(oldState, newState);
        return;
    }

    //User leaves the channel
    if(oldState.channel && !newState.channel) {
        await saveListeningTime(oldState, newState);
        return;
    }
});

async function saveJoinTime(oldState:VoiceState, newState:VoiceState) {
    const doc = await DatabaseHandler.PlayTime.findOne({guild:newState.guild.id, "users.id":newState.member?.id}).exec();
    if(!doc) {
        await DatabaseHandler.PlayTime.updateOne({guild:newState.guild.id}, {$push: {users:{id:newState.member?.id, joinTime:Date.now()}}}, {upsert:true}).exec();
        return;
    }

    await DatabaseHandler.PlayTime.updateOne({guild:newState.guild.id, "users.id":`${newState.member?.id}`}, {$set: {"users.$.joinTime":Date.now()}}).exec();
}

async function saveListeningTime(oldState:VoiceState, newState:VoiceState) {
    const doc = await DatabaseHandler.PlayTime.findOne({guild:oldState.guild.id, "users.id":`${newState.member?.id}`}).exec();
    if(!doc) return;

    const userDatas = doc.users.filter((element) => element.id == oldState.member?.id);
    if(userDatas.length < 1) return;
    
    const userData = userDatas[0];
    const joinTime = userData.joinTime;

    const now = Date.now();
    const listeningTime = (doc.time || 0) + (now - (joinTime || now));

    await DatabaseHandler.PlayTime.updateOne({guild:newState.guild.id, "users.id":`${newState.member?.id}`}, {$set: {"users.$.time":listeningTime}, $unset:{"users.$.joinTime":""}}, {upsert:true}).exec();
}

main();