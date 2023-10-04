import {createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus, AudioPlayer, AudioResource, PlayerSubscription, joinVoiceChannel, VoiceConnection} from '@discordjs/voice';
import { InternalDiscordGatewayAdapterCreator } from 'discord.js';

import Data from '../data'

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

function play(guild:string, audioResource:string, savePlayTimeData?:boolean):boolean {
    if(!playerMap.has(guild)) {
        addAudioPlayer(guild);
    }

    let playerData = playerMap.get(guild);
    if(!playerData) return false;

    setResource(guild, audioResource);
    playerData = playerMap.get(guild);

    if(!playerData?.resource) return false;

    if(savePlayTimeData) {
        setPlayTimeData(guild);
    }

    playerData.player.play(loadResource(playerData.resource));
    Data.playTimeMap.set(guild, {lastStart:Date.now(), time:Data.playTimeMap.get(guild)?.time || 0})
    return true;
}

function setPlayTimeData(guild:string) {
    const playStart = Data.playTimeMap.get(guild);
    if(!playStart) return;

    const now = Date.now();
    const newTime = (playStart.time || 0) + (now - (playStart.lastStart || now));
    Data.playTimeMap.set(guild, {lastStart:undefined, time:newTime});
}

function pause(guild:string):boolean {
    if(!playerMap.has(guild)) return false;

    const playerData = playerMap.get(guild);
    if(!playerData) return false;

    playerData?.player.pause();
    setPlayTimeData(guild);

    return true;
}

function unpause(guild:string):boolean {
    if(!playerMap.has(guild)) return false;

    const playerData = playerMap.get(guild);
    if(!playerData) return false;

    playerData?.player.unpause();
    Data.playTimeMap.set(guild, {lastStart:Date.now()});

    return true;
}

function stop(guild:string):boolean {
    if(!playerMap.has(guild)) return false;

    const playerData = playerMap.get(guild);
    if(!playerData) return false;
    
    playerData?.player.stop()
    setPlayTimeData(guild);

    console.log(new Date(Data.playTimeMap.get(guild)?.time || 0).getMinutes());

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