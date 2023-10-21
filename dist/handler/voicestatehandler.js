"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databasehandler_1 = __importDefault(require("./databasehandler"));
const audiohandler_1 = __importDefault(require("./audiohandler"));
async function saveJoinTime(voiceState) {
    const doc = await databasehandler_1.default.PlayTime.findOne({ guild: voiceState.guild.id, "users.id": voiceState.member?.id }).exec();
    if (!doc) {
        await databasehandler_1.default.PlayTime.updateOne({ guild: voiceState.guild.id }, { $push: { users: { id: voiceState.member?.id, joinTime: Date.now() } } }, { upsert: true }).exec();
        return;
    }
    await databasehandler_1.default.PlayTime.updateOne({ guild: voiceState.guild.id, "users.id": `${voiceState.member?.id}` }, { $set: { "users.$.joinTime": Date.now() } }).exec();
}
async function saveListeningTime(voiceState) {
    const doc = await databasehandler_1.default.PlayTime.findOne({ guild: voiceState.guild.id, "users.id": `${voiceState.member?.id}` }).exec();
    if (!doc)
        return;
    const userDatas = doc.users.filter((element) => element.id == voiceState.member?.id);
    if (userDatas.length < 1)
        return;
    const userData = userDatas[0];
    const joinTime = userData.joinTime;
    const now = Date.now();
    const listeningTime = (userData.time || 0) + (now - (joinTime || now));
    await databasehandler_1.default.PlayTime.updateOne({ guild: voiceState.guild.id, "users.id": `${voiceState.member?.id}` }, { $set: { "users.$.time": listeningTime }, $unset: { "users.$.joinTime": "" } }, { upsert: true }).exec();
}
async function checkStates(client, oldState, newState) {
    if (!client.user)
        return;
    //deafened
    if (!oldState.deaf && newState.deaf && newState.channel?.members.has(client.user?.id)) {
        await saveListeningTime(newState);
        return;
    }
    //not deafened
    if (oldState.deaf && !newState.deaf && newState.channel?.members.has(client.user?.id)) {
        await saveJoinTime(newState);
        return;
    }
    //User joins the channel
    if (!oldState.channel && newState.channel && !newState.deaf && newState.channel?.members.has(client.user?.id)) {
        await saveJoinTime(newState);
        return;
    }
    //User leaves the channel
    if (oldState.channel && !newState.channel && oldState.channel?.members.has(client.user?.id)) {
        await saveListeningTime(newState);
        return;
    }
}
exports.default = {
    saveJoinTime: saveJoinTime,
    saveListeningTime: saveListeningTime,
    handle: async function handle(client, oldState, newState) {
        if (newState.member?.user == client.user) {
            //Rythma logic
            //Rythma joins
            if (!oldState.channel && newState.channel && !newState.mute) {
                newState.channel.members.forEach(async (member) => {
                    if (member.id === client.user?.id)
                        return;
                    if (member.voice.deaf)
                        return;
                    await saveJoinTime(member.voice);
                });
                return;
            }
            //Rythma leaves
            if (oldState.channel && !newState.channel) {
                oldState.channel.members.forEach(async (member) => {
                    if (member.id === client.user?.id)
                        return;
                    await saveListeningTime(member.voice);
                });
                return;
            }
            //Rythma gets muted
            if (!oldState.mute && newState.mute && newState.channel) {
                newState.channel.members.forEach(async (member) => {
                    if (member.id === client.user?.id)
                        return;
                    await saveListeningTime(member.voice);
                });
                audiohandler_1.default.pause(newState.guild.id);
                return;
            }
            //Rythma get unmuted
            if (oldState.mute && !newState.mute && newState.channel) {
                newState.channel.members.forEach(async (member) => {
                    if (member.id === client.user?.id)
                        return;
                    if (member.voice.deaf)
                        return;
                    await saveJoinTime(member.voice);
                });
                audiohandler_1.default.unpause(newState.guild.id);
                return;
            }
            return;
        }
        await checkStates(client, oldState, newState);
    }
};
