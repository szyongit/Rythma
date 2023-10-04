"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const data_1 = __importDefault(require("../data"));
const playerMap = new Map();
function addAudioPlayer(guild) {
    if (playerMap.has(guild))
        return;
    const player = (0, voice_1.createAudioPlayer)({
        behaviors: {
            noSubscriber: voice_1.NoSubscriberBehavior.Pause,
        },
    });
    playerMap.set(guild, { player: player, resource: undefined });
}
function setResource(guild, audioResource) {
    const playerData = playerMap.get(guild);
    if (!playerData)
        return;
    playerData.resource = audioResource;
    playerMap.set(guild, playerData);
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
function play(guild, audioResource, savePlayTimeData) {
    if (!playerMap.has(guild)) {
        addAudioPlayer(guild);
    }
    let playerData = playerMap.get(guild);
    if (!playerData)
        return false;
    setResource(guild, audioResource);
    playerData = playerMap.get(guild);
    if (!playerData?.resource)
        return false;
    if (savePlayTimeData) {
        setPlayTimeData(guild);
    }
    playerData.player.play(loadResource(playerData.resource));
    data_1.default.playTimeMap.set(guild, { lastStart: Date.now(), time: data_1.default.playTimeMap.get(guild)?.time || 0 });
    return true;
}
function setPlayTimeData(guild) {
    const playStart = data_1.default.playTimeMap.get(guild);
    if (!playStart)
        return;
    const now = Date.now();
    const newTime = (playStart.time || 0) + (now - (playStart.lastStart || now));
    data_1.default.playTimeMap.set(guild, { lastStart: undefined, time: newTime });
}
function pause(guild) {
    if (!playerMap.has(guild))
        return false;
    const playerData = playerMap.get(guild);
    if (!playerData)
        return false;
    playerData?.player.pause();
    setPlayTimeData(guild);
    return true;
}
function unpause(guild) {
    if (!playerMap.has(guild))
        return false;
    const playerData = playerMap.get(guild);
    if (!playerData)
        return false;
    playerData?.player.unpause();
    data_1.default.playTimeMap.set(guild, { lastStart: Date.now() });
    return true;
}
function stop(guild) {
    if (!playerMap.has(guild))
        return false;
    const playerData = playerMap.get(guild);
    if (!playerData)
        return false;
    playerData?.player.stop();
    setPlayTimeData(guild);
    console.log(new Date(data_1.default.playTimeMap.get(guild)?.time || 0).getMinutes());
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
