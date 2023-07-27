import {createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus, AudioPlayer, AudioResource, PlayerSubscription, joinVoiceChannel, VoiceConnection} from '@discordjs/voice';
import { InternalDiscordGatewayAdapterCreator } from 'discord.js';

const playerMap = new Map<string, {player:AudioPlayer, resource:AudioResource | undefined}>();

function addAudioPlayer(guild:string) {
    if(playerMap.has(guild)) return;

    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        },
    })
    setPlayerListeners(player);
    playerMap.set(guild, {player:player, resource:undefined});
}

function setResource(guild:string, audioResource:AudioResource<unknown>) {
    const playerData = playerMap.get(guild);
    if(!playerData) return;
    
    playerData.resource = audioResource;
    playerMap.set(guild, playerData);
}

function setPlayerListeners(player:AudioPlayer) {
    player.on(AudioPlayerStatus.Playing, () => {
        console.log("Player is playing!");
    })
    player.on(AudioPlayerStatus.Paused, () => {
        console.log("Player is paused!");
    })
    player.on(AudioPlayerStatus.Idle, () => {
        console.log("Player is idling!");
    })}

function loadResource(url:string): AudioResource {
    return createAudioResource(url);
}

function getData(guild:string): {player:AudioPlayer, resource:AudioResource | undefined} | undefined {
    if(!playerMap.has(guild)) return;

    const playerData = playerMap.get(guild);
    if(!playerData) return undefined;

    return playerData;
}

function play(guild:string, audioResource:AudioResource<unknown>):boolean {
    if(!playerMap.has(guild)) {
        addAudioPlayer(guild);
    }

    let playerData = playerMap.get(guild);
    if(!playerData) return false;

    setResource(guild, audioResource);
    playerData = playerMap.get(guild);

    if(!playerData?.resource) return false;

    playerData.player.play(playerData?.resource);
    return true;
}

function pause(guild:string):boolean {
    if(!playerMap.has(guild)) return false;

    const playerData = playerMap.get(guild);
    if(!playerData) return false;

    playerData?.player.pause();
    return true;
}

function unpause(guild:string):boolean {
    if(!playerMap.has(guild)) return false;

    const playerData = playerMap.get(guild);
    if(!playerData) return false;

    playerData?.player.unpause();
    return true;
}

function stop(guild:string):boolean {
    if(!playerMap.has(guild)) return false;

    const playerData = playerMap.get(guild);
    if(!playerData) return false;
    
    playerData?.player.stop()
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