import { Client, VoiceState } from "discord.js";

import DatabaseHandler from "./databasehandler";
import AudioHandler from "./audiohandler";

async function saveJoinTime(voiceState:VoiceState) {
    const doc = await DatabaseHandler.PlayTime.findOne({guild:voiceState.guild.id, "users.id":voiceState.member?.id}).exec();
    if(!doc) {
        await DatabaseHandler.PlayTime.updateOne({guild:voiceState.guild.id}, {$push: {users:{id:voiceState.member?.id, joinTime:Date.now()}}}, {upsert:true}).exec();
        return;
    }

    await DatabaseHandler.PlayTime.updateOne({guild:voiceState.guild.id, "users.id":`${voiceState.member?.id}`}, {$set: {"users.$.joinTime":Date.now()}}).exec();
}

async function saveListeningTime(voiceState:VoiceState) {
    const doc = await DatabaseHandler.PlayTime.findOne({guild:voiceState.guild.id, "users.id":`${voiceState.member?.id}`}).exec();
    if(!doc) return;

    const userDatas = doc.users.filter((element) => element.id == voiceState.member?.id);
    if(userDatas.length < 1) return;
    
    const userData = userDatas[0];
    const joinTime = userData.joinTime;

    const now = Date.now();
    const listeningTime = (userData.time || 0) + (now - (joinTime || now));

    await DatabaseHandler.PlayTime.updateOne({guild:voiceState.guild.id, "users.id":`${voiceState.member?.id}`}, {$set: {"users.$.time":listeningTime}, $unset:{"users.$.joinTime":""}}, {upsert:true}).exec();
}

async function checkStates(client:Client, oldState:VoiceState, newState:VoiceState) {
    if(!client.user) return;

    //deafened
    if(!oldState.deaf && newState.deaf && newState.channel?.members.has(client.user?.id)) {
        await saveListeningTime(newState);
        return;
    }

    //not deafened
    if(oldState.deaf && !newState.deaf && newState.channel?.members.has(client.user?.id)) {
        await saveJoinTime(newState);
        return;
    }

    //User joins the channel
    if(!oldState.channel && newState.channel && !newState.deaf && newState.channel?.members.has(client.user?.id)) {
        await saveJoinTime(newState);
        return;
    }

    //User leaves the channel
    if(oldState.channel && !newState.channel && oldState.channel?.members.has(client.user?.id)) {
        await saveListeningTime(newState);
        return;
    }
}

export default {
    saveJoinTime:saveJoinTime,
    saveListeningTime:saveListeningTime,
    handle: async function handle(client:Client, oldState:VoiceState, newState:VoiceState) {
    if(newState.member?.user == client.user) {
        //Rythma logic
        //Rythma joins
        if(!oldState.channel && newState.channel && !newState.mute) {
            newState.channel.members.forEach(async (member) => {
                if(member.id === client.user?.id) return;
                if(member.voice.deaf) return;
                await saveJoinTime(member.voice);
            })
            return;
        }

        //Rythma leaves
        if(oldState.channel && !newState.channel) {
            oldState.channel.members.forEach(async (member) => {
                if(member.id === client.user?.id) return;
                await saveListeningTime(member.voice);
            })
            return;
        }

        //Rythma gets muted
        if(!oldState.mute && newState.mute && newState.channel) {
            newState.channel.members.forEach(async (member) => {
                if(member.id === client.user?.id) return;
                await saveListeningTime(member.voice);
            });
            AudioHandler.pause(newState.guild.id);
            return;
        }

        //Rythma get unmuted
        if(oldState.mute && !newState.mute && newState.channel) {
            newState.channel.members.forEach(async (member) => {
                if(member.id === client.user?.id) return;
                if(member.voice.deaf) return;
                await saveJoinTime(member.voice);
            });
            AudioHandler.unpause(newState.guild.id);
            return;
        }

        return;
    }
    
    await checkStates(client, oldState, newState);
}}