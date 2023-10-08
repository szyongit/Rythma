"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databasehandler_1 = __importDefault(require("./databasehandler"));
async function checkStates(client, oldState, newState) {
    //deafened
    if (newState.deaf) {
        await saveListeningTime(newState);
        return;
    }
    //not deafened
    if (!newState.deaf) {
        await saveJoinTime(newState);
        return;
    }
    //User joins the channel
    if (!oldState.channel && newState.channel && !newState.deaf) {
        await saveJoinTime(newState);
        return;
    }
    //User leaves the channel
    if (oldState.channel && !newState.channel) {
        await saveListeningTime(newState);
        return;
    }
}
async function saveJoinTime(newState) {
    const doc = await databasehandler_1.default.PlayTime.findOne({ guild: newState.guild.id, "users.id": newState.member?.id }).exec();
    if (!doc) {
        await databasehandler_1.default.PlayTime.updateOne({ guild: newState.guild.id }, { $push: { users: { id: newState.member?.id, joinTime: Date.now() } } }, { upsert: true }).exec();
        return;
    }
    await databasehandler_1.default.PlayTime.updateOne({ guild: newState.guild.id, "users.id": `${newState.member?.id}` }, { $set: { "users.$.joinTime": Date.now() } }).exec();
}
async function saveListeningTime(newState) {
    const doc = await databasehandler_1.default.PlayTime.findOne({ guild: newState.guild.id, "users.id": `${newState.member?.id}` }).exec();
    if (!doc)
        return;
    const userDatas = doc.users.filter((element) => element.id == newState.member?.id);
    if (userDatas.length < 1)
        return;
    const userData = userDatas[0];
    const joinTime = userData.joinTime;
    const now = Date.now();
    const listeningTime = (doc.time || 0) + (now - (joinTime || now));
    await databasehandler_1.default.PlayTime.updateOne({ guild: newState.guild.id, "users.id": `${newState.member?.id}` }, { $set: { "users.$.time": listeningTime }, $unset: { "users.$.joinTime": "" } }, { upsert: true }).exec();
}
exports.default = { handle: async function handle(client, oldState, newState) {
        if (newState.member?.user == client.user) {
            //Rythma enters or leaves
            if (!oldState.channel && newState.channel) {
                //Rythma joins
                newState.channel.members.forEach(async (member) => {
                    if (member.voice.deaf)
                        return;
                    await saveJoinTime(member.voice);
                });
                return;
            }
            if (oldState.channel && !newState.channel) {
                //Rythma leaves
                oldState.channel.members.forEach(async (member) => {
                    await saveListeningTime(member.voice);
                });
                return;
            }
            return;
        }
        if (!newState.channel?.members.has(client.user?.id || ""))
            return;
        await checkStates(client, oldState, newState);
    } };
