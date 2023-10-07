import {createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayer, AudioResource, joinVoiceChannel, VoiceConnection} from '@discordjs/voice';
import { InternalDiscordGatewayAdapterCreator, ReactionUserManager } from 'discord.js';

import DatabaseHandler from '../handler/databasehandler';

const playerMap = new Map<string, {player:AudioPlayer, resource:string | undefined}>();

function addAudioPlayer(guild:string) {
    if(playerMap.has(guild)) return;

    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        },
    })
    playerMap.set(guild, {player:player, resource:undefined});
}

function setResource(guild:string, audioResource:string) {
    const playerData = playerMap.get(guild);
    if(!playerData) return;
    
    playerData.resource = audioResource;
    playerMap.set(guild, playerData);
}

function loadResource(url:string): AudioResource {
    return createAudioResource(url);
}

function getData(guild:string): {player:AudioPlayer, resource:string | undefined} | undefined {
    if(!playerMap.has(guild)) return;

    const playerData = playerMap.get(guild);
    if(!playerData) return undefined;

    return playerData;
}

function play(guild:string, audioResource:string):boolean {
    if(!playerMap.has(guild)) {
        addAudioPlayer(guild);
    }

    let playerData = playerMap.get(guild);
    if(!playerData) return false;

    setResource(guild, audioResource);
    playerData = playerMap.get(guild);

    if(!playerData?.resource) return false;

    const resource = loadResource(playerData.resource);
    resource.volume?.setVolume(0.75);

    DatabaseHandler.PlayTime.findOne({guild:guild}).exec().then((doc) => {
        if(!doc) {
            DatabaseHandler.PlayTime.updateOne({guild:guild}, {lastStart:Date.now(), playing:true}, {upsert:true}).exec();
            return;
        }

        if(doc.playing === true) {
            const now = Date.now();
            const newTime = (doc.time || 0) + (now - (doc.lastStart || now));
            DatabaseHandler.PlayTime.updateOne({guild:guild}, {time:newTime, lastStart:Date.now(), playing:true}).exec();
            return;
        }
        
        DatabaseHandler.PlayTime.updateOne({guild:guild}, {lastStart:Date.now(), playing:true}, {upsert:true}).exec();
    });

    playerData.player.play(resource/*loadResource(playerData.resource)*/);
    return true;
}

function pause(guild:string):boolean {
    if(!playerMap.has(guild)) return false;

    const playerData = playerMap.get(guild);
    if(!playerData) return false;

    DatabaseHandler.PlayTime.findOne({guild:guild}).exec().then((doc) => {
        if(!doc) return;
        if(doc.playing === false) return;

        const now = Date.now();
        const newTime = (doc.time || 0) + (now - (doc.lastStart || now));
        DatabaseHandler.PlayTime.updateOne({guild:guild}, {time:newTime, playing:false}).exec();
    });
    playerData?.player.pause();

    return true;
}

function unpause(guild:string):boolean {
    if(!playerMap.has(guild)) return false;

    const playerData = playerMap.get(guild);
    if(!playerData) return false;

    DatabaseHandler.PlayTime.findOne({guild:guild}).exec().then((doc) => {
        DatabaseHandler.PlayTime.updateOne({guild:guild}, {lastStart:Date.now(), playing:true}, {upsert:true}).exec();
    });
    playerData?.player.unpause();

    return true;
}

function stop(guild:string):boolean {
    if(!playerMap.has(guild)) return false;

    const playerData = playerMap.get(guild);
    if(!playerData) return false;
    
    DatabaseHandler.PlayTime.findOne({guild:guild}).exec().then((doc) => {
        if(!doc) return;
        if(doc.playing === false) return;

        const now = Date.now();
        const newTime = (doc.time || 0) + (now - (doc.lastStart || now));
        DatabaseHandler.PlayTime.updateOne({guild:guild}, {time:newTime, playing:false}).exec();
    });
    playerData?.player.stop();

    return true;
}

function connectToVoiceChannel(channelId:string, guildId:string, adapterCreator:InternalDiscordGatewayAdapterCreator):VoiceConnection {
    const connection = joinVoiceChannel({
        channelId: channelId,
        guildId: guildId,
        adapterCreator: adapterCreator
    });

    return connection;
}


export default {
    play:play,
    stop:stop,
    pause:pause,
    unpause:unpause,
    getData:getData,
    loadResource:loadResource,
    connectToVoiceChannel:connectToVoiceChannel
}