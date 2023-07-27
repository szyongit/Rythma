import { Client, GuildMember, Interaction } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

import data from '../data';
import AudioHandler from './audiohandler';


async function handle(client: Client, interaction: Interaction) {
    const guild = interaction.guild;
    if (!guild) {
        return;
    }

    const isVoiceChannelConnected = (<GuildMember>interaction.member).voice;
    const channelId = isVoiceChannelConnected.channelId;
    if (!channelId) return;

    const guildId = interaction.guildId;
    if (!guildId) {
        return;
    }


    if (interaction.isStringSelectMenu()) {
        if (interaction.customId !== 'genre_selector') return;
        let value = "";
        interaction.values.forEach((loopValue) => value = loopValue);

        const url = data.get(value);
        if (!url) {
            interaction.reply({ content: "This genre is not implemented yet!", ephemeral:true}).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }

        await interaction.reply({content:'Loading stream...'});

        const connection = AudioHandler.connectToVoiceChannel(channelId, guildId, guild.voiceAdapterCreator);
        const audioRource = AudioHandler.loadResource(url);
        AudioHandler.play(guildId, audioRource);

        const audioData = AudioHandler.getData(guildId);
        if (!audioData) {
            interaction.editReply({ content: "OOPS, something went wrong!" }).then(message => setTimeout(() => message.delete(), 2500));
            AudioHandler.stop(guildId);
            return;
        }

        connection.subscribe(audioData.player);
        interaction.editReply({ content: "Playing..." }).then(message => setTimeout(() => message.delete(), 2500));
        return;
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'play_button') {
            const audioData = AudioHandler.getData(guildId);
            if (!audioData) {
                interaction.reply({ content: "Please select a genre to play!", ephemeral:true}).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }

            if (!audioData.resource) {
                interaction.reply({ content: "Please select a genre!", ephemeral:true}).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }

            const connection = AudioHandler.connectToVoiceChannel(channelId, guildId, guild.voiceAdapterCreator);
            AudioHandler.play(guildId, audioData.resource);
            connection.subscribe(audioData.player);

            interaction.reply({ content: "Playing ▶!", ephemeral:true}).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (interaction.customId === 'pause_button') {
            const paused = AudioHandler.pause(guildId);
            if (!paused) {
                interaction.reply({ content: "OOPS, something went wrong!", ephemeral: true }).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }

            interaction.reply({ content: "Paused ⏸!", ephemeral:true}).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (interaction.customId === 'stop_button') {
            const stopped = AudioHandler.stop(guildId);
            if (!stopped) return;

            interaction.reply({ content: "Stopped ⏹!", ephemeral:true}).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (interaction.customId === 'leave_button') {
            const connection = getVoiceConnection(guildId);
            if (!connection) {
                interaction.reply({ content: 'I am in not voice channel!', ephemeral: true }).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }

            AudioHandler.stop(guildId);
            connection.disconnect();
            connection.destroy();
            interaction.reply({ content: "I left the voice channel!", ephemeral: true }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
    }
}

export default {
    handle: handle
}