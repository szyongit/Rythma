"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const playerMap = new Map();
function addAudioPlayer(guild) {
    if (playerMap.has(guild))
        return;
    const player = (0, voice_1.createAudioPlayer)({
        behaviors: {
            noSubscriber: voice_1.NoSubscriberBehavior.Pause,
        },
    });
    setPlayerListeners(player);
    playerMap.set(guild, { player: player, resource: undefined });
}
function setResource(guild, audioResource) {
    const playerData = playerMap.get(guild);
    if (!playerData)
        return;
    playerData.resource = audioResource;
    playerMap.set(guild, playerData);
}
function setPlayerListeners(player) {
    player.on(voice_1.AudioPlayerStatus.Playing, () => {
        console.log("Player is playing!");
    });
    player.on(voice_1.AudioPlayerStatus.Paused, () => {
        console.log("Player is paused!");
    });
    player.on(voice_1.AudioPlayerStatus.Idle, () => {
        console.log("Player is idling!");
    });
}
function loadResource(url) {
    return (0, voice_1.createAudioResource)(url);
}
function getData(guild) {
    if (!playerMap.has(guild))
        return;
    const playerData = playerMap.get(guild);
    if (!playerData)
        return undefined;
    return playerData;
}
function play(guild, audioResource) {
    if (!playerMap.has(guild)) {
        addAudioPlayer(guild);
    }
    let playerData = playerMap.get(guild);
    if (!playerData)
        return false;
    setResource(guild, audioResource);
    playerData = playerMap.get(guild);
    if (!playerData?.resource || playerData.resource.ended)
        return false;
    playerData.player.play(playerData?.resource);
    return true;
}
function pause(guild) {
    if (!playerMap.has(guild))
        return false;
    const playerData = playerMap.get(guild);
    if (!playerData)
        return false;
    playerData?.player.pause();
    return true;
}
function unpause(guild) {
    if (!playerMap.has(guild))
        return false;
    const playerData = playerMap.get(guild);
    if (!playerData)
        return false;
    playerData?.player.unpause();
    return true;
}
function stop(guild) {
    if (!playerMap.has(guild))
        return false;
    const playerData = playerMap.get(guild);
    if (!playerData)
        return false;
    playerData?.player.stop();
    return true;
}
function connectToVoiceChannel(channelId, guildId, adapterCreator) {
    const connection = (0, voice_1.joinVoiceChannel)({
        channelId: channelId,
        guildId: guildId,
        adapterCreator: adapterCreator
    });
    return connection;
}
exports.default = {
    play: play,
    stop: stop,
    pause: pause,
    unpause: unpause,
    getData: getData,
    loadResource: loadResource,
    connectToVoiceChannel: connectToVoiceChannel
};
