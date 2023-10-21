"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const databasehandler_1 = __importDefault(require("../handler/databasehandler"));
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
function play(guild, audioResource) {
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
    const resource = loadResource(playerData.resource);
    resource.volume?.setVolume(0.5);
    databasehandler_1.default.PlayTime.findOne({ guild: guild }).exec().then((doc) => {
        if (!doc) {
            databasehandler_1.default.PlayTime.updateOne({ guild: guild }, { lastStart: Date.now(), playing: true }, { upsert: true }).exec();
            return;
        }
        if (doc.playing === true) {
            const now = Date.now();
            const newTime = (doc.time || 0) + (now - (doc.lastStart || now));
            databasehandler_1.default.PlayTime.updateOne({ guild: guild }, { time: newTime, lastStart: Date.now(), playing: true }).exec();
            return;
        }
        databasehandler_1.default.PlayTime.updateOne({ guild: guild }, { lastStart: Date.now(), playing: true }, { upsert: true }).exec();
    });
    playerData.player.play(resource /*loadResource(playerData.resource)*/);
    return true;
}
function pause(guild) {
    if (!playerMap.has(guild))
        return false;
    const playerData = playerMap.get(guild);
    if (!playerData)
        return false;
    databasehandler_1.default.PlayTime.findOne({ guild: guild }).exec().then((doc) => {
        if (!doc)
            return;
        if (doc.playing === false)
            return;
        const now = Date.now();
        const newTime = (doc.time || 0) + (now - (doc.lastStart || now));
        databasehandler_1.default.PlayTime.updateOne({ guild: guild }, { time: newTime, playing: false }).exec();
    });
    playerData.player.pause();
    return true;
}
function unpause(guild) {
    if (!playerMap.has(guild))
        return false;
    const playerData = playerMap.get(guild);
    if (!playerData)
        return false;
    databasehandler_1.default.PlayTime.findOne({ guild: guild }).exec().then((doc) => {
        databasehandler_1.default.PlayTime.updateOne({ guild: guild }, { lastStart: Date.now(), playing: true }, { upsert: true }).exec();
    });
    playerData?.player.unpause();
    return true;
}
function stop(guild) {
    if (!playerMap.has(guild))
        return false;
    const playerData = playerMap.get(guild);
    if (!playerData)
        return false;
    databasehandler_1.default.PlayTime.findOne({ guild: guild }).exec().then((doc) => {
        if (!doc)
            return;
        if (doc.playing === false)
            return;
        const now = Date.now();
        const newTime = (doc.time || 0) + (now - (doc.lastStart || now));
        databasehandler_1.default.PlayTime.updateOne({ guild: guild }, { time: newTime, playing: false }).exec();
    });
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
