import { Client, GuildMember, Interaction, InternalDiscordGatewayAdapterCreator } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

import data from '../data';
import AudioHandler from './audiohandler';
import Replyembed from "../components/replyembed";

type VoiceState = {data:{channelId:string, guildId:string}, isConnected:boolean, isError:boolean};
function getVoiceState(interaction:Interaction):VoiceState {
    const data = {data:{channelId:"", guildId:"", voiceAdapter:undefined}, isConnected:false, isError:false};

    const voiceChannelConnection = (<GuildMember>interaction.member).voice;
    data.isConnected = (voiceChannelConnection !== null || voiceChannelConnection !== undefined);
    if(!voiceChannelConnection) return data;

    const guild = interaction.guild;
    if (!guild)  {
        data.isError = true;
        return data;
    }
    data.data.guildId = guild.id;

    const channelId = voiceChannelConnection.channelId;
    if (!channelId) {
        data.isError = true;
        return data;
    }
    data.data.channelId = channelId;

    return data;
}

async function handle(client: Client, interaction: Interaction) {
    if (interaction.isStringSelectMenu()) {
        const voiceState = getVoiceState(interaction);
        if(!voiceState.isConnected) {
            interaction.reply({ embeds: [Replyembed.build({ title: 'You have to be connected to a voice channel!', isError:true })], ephemeral: true });
            return;
        }

        if(voiceState.isError) {
            interaction.reply({ embeds: [Replyembed.build({ title: 'OOPS, an error occured!', isError:true })], ephemeral: true });
            return;
        }

        if (interaction.customId !== 'genre_selector') return;
        let value = "";
        interaction.values.forEach((loopValue) => value = loopValue);

        if(value === 'none') {
            AudioHandler.stop(voiceState.data.guildId);
            interaction.reply({ embeds: [Replyembed.build({ title: 'Stopped playing!', color:'Red' })], ephemeral: true }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }

        const url = data.channelsMap.get(value);
        if (!url) {
            interaction.reply({ embeds: [Replyembed.build({ title: 'This genre is not implemented yet!', isError: true })], ephemeral: true }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }

        if(!interaction.guild) {
            interaction.reply({ embeds: [Replyembed.build({ title: 'OOPS, an error occured!', isError:true })], ephemeral: true });
            return;
        }

        await interaction.reply({ embeds: [Replyembed.build({ title: '•••' })] });

        const connection = AudioHandler.connectToVoiceChannel(voiceState.data.channelId, voiceState.data.guildId, interaction.guild.voiceAdapterCreator);
        const audioRource = AudioHandler.loadResource(url);
        AudioHandler.play(voiceState.data.guildId, audioRource);

        const audioData = AudioHandler.getData(voiceState.data.guildId);
        if (!audioData) {
            interaction.editReply({ embeds: [Replyembed.build({ title: 'OOPS, an error occured!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
            AudioHandler.stop(voiceState.data.guildId);
            return;
        }

        connection.subscribe(audioData.player);
        interaction.editReply({ embeds: [Replyembed.build({ title: '▶', color: 'Green' })] }).then(message => setTimeout(() => message.delete(), 2500));
        return;
    }

    if (interaction.isButton()) {
        const voiceState = getVoiceState(interaction);
        if(!voiceState.isConnected) {
            interaction.reply({ embeds: [Replyembed.build({ title: 'You have to be connected to a voice channel!', isError:true })], ephemeral: true });
            return;
        }

        if(voiceState.isError) {
            interaction.reply({ embeds: [Replyembed.build({ title: 'OOPS, an error occured!', isError:true })], ephemeral: true });
            return;
        }

        if (interaction.customId === 'play_button') {
            const audioData = AudioHandler.getData(voiceState.data.guildId);
            if (!audioData || !audioData.resource) {
                interaction.reply({ embeds: [Replyembed.build({ title: 'Please select a genre to play!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }

            if(!interaction.guild) {
                interaction.reply({ embeds: [Replyembed.build({ title: 'OOPS, an error occured!', isError:true })], ephemeral: true });
                return;
            }

            await interaction.reply({ embeds: [Replyembed.build({ title: 'Loading stream...' })] });

            const connection = AudioHandler.connectToVoiceChannel(voiceState.data.channelId, voiceState.data.guildId, interaction.guild.voiceAdapterCreator);
            AudioHandler.play(voiceState.data.guildId, audioData.resource);
            connection.subscribe(audioData.player);

            interaction.editReply({ embeds: [Replyembed.build({ title: '▶', color: 'Green' })] }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (interaction.customId === 'pause_button') {
            const paused = AudioHandler.pause(voiceState.data.guildId);
            if (!paused) {
                interaction.reply({ embeds: [Replyembed.build({ title: 'OOPS, an error occured!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }

            interaction.reply({ embeds: [Replyembed.build({ title: '⏸', color: 'Grey' })] }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (interaction.customId === 'stop_button') {
            const stopped = AudioHandler.stop(voiceState.data.guildId);
            if (!stopped) return;

            interaction.reply({ embeds: [Replyembed.build({ title: '⏹', color: 'Red' })] }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (interaction.customId === 'leave_button') {
            const connection = getVoiceConnection(voiceState.data.guildId);
            if (!connection) {
                interaction.reply({ embeds: [Replyembed.build({ title: 'I am in no voicechannel!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }

            AudioHandler.stop(voiceState.data.guildId);
            connection.disconnect();
            connection.destroy();
            interaction.reply({ embeds: [Replyembed.build({ title: 'I left the voicechannel!' })] }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
    }
}

export default {
    handle: handle
}