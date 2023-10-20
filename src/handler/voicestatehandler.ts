import { Client, VoiceState } from "discord.js";

import DatabaseHandler from "./databasehandler";

async function saveJoinTime(newState:VoiceState) {
    const doc = await DatabaseHandler.PlayTime.findOne({guild:newState.guild.id, "users.id":newState.member?.id}).exec();
    if(!doc) {
        await DatabaseHandler.PlayTime.updateOne({guild:newState.guild.id}, {$push: {users:{id:newState.member?.id, joinTime:Date.now()}}}, {upsert:true}).exec();
        return;
    }

    await DatabaseHandler.PlayTime.updateOne({guild:newState.guild.id, "users.id":`${newState.member?.id}`}, {$set: {"users.$.joinTime":Date.now()}}).exec();
}

async function saveListeningTime(voiceState:VoiceState) {
    const doc = await DatabaseHandler.PlayTime.findOne({guild:voiceState.guild.id, "users.id":`${voiceState.member?.id}`}).exec();
    if(!doc) return;

    const userDatas = doc.users.filter((element) => element.id == voiceState.member?.id);
    if(userDatas.length < 1) return;
    
    const userData = userDatas[0];
    const joinTime = userData.joinTime;

    const now = Date.now();
    const listeningTime = (doc.time || 0) + (now - (joinTime || now));

    await DatabaseHandler.PlayTime.updateOne({guild:voiceState.guild.id, "users.id":`${voiceState.member?.id}`}, {$set: {"users.$.time":listeningTime}, $unset:{"users.$.joinTime":""}}, {upsert:true}).exec();
}

async function checkStates(client:Client, oldState:VoiceState, newState:VoiceState) {
    //deafened
    if(!oldState.deaf && newState.deaf && !newState.channel?.members.has(client.user?.id || "")) {
        await saveListeningTime(newState);
        return;
    }

    //not deafened
    if(oldState.deaf && !newState.deaf && !newState.channel?.members.has(client.user?.id || "")) {
        await saveJoinTime(newState);
        return;
    }

    //User joins the channel
    if(!oldState.channel && newState.channel && !newState.deaf && !newState.channel?.members.has(client.user?.id || "")) {
        await saveJoinTime(newState);
        return;
    }

    //User leaves the channel
    if(oldState.channel && !newState.channel && !oldState.channel?.members.has(client.user?.id || "")) {
        await saveListeningTime(newState);
        return;
    }
}

export default {handle: async function handle(client:Client, oldState:VoiceState, newState:VoiceState) {
    if(newState.member?.user == client.user) {
        //Rythma logic
        if(!oldState.channel && newState.channel) {
            //Rythma joins
            newState.channel.members.forEach(async (member) => {
                if(member.voice.deaf) return;
                await saveJoinTime(member.voice);
            })
            return;
        }

        if(oldState.channel && !newState.channel) {
            //Rythma leaves
            oldState.channel.members.forEach(async (member) => {
                await saveListeningTime(member.voice);
            })
            return;
        }

        if(!oldState.deaf && newState.deaf && newState.channel) {
            //Rythma get deafened
            newState.channel.members.forEach(async (member) => {
                await saveListeningTime(member.voice);
            })
            return;
        }

        if(oldState.deaf && !newState.deaf && newState.channel) {
            //Rythma get undeafened
            newState.channel.members.forEach(async (member) => {
                await saveJoinTime(member.voice);
            })
            return;
        }

        return;
    }
    
    await checkStates(client, oldState, newState);
}}