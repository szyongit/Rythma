import { Client, GuildMember, Interaction } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

import data from '../data';
import AudioHandler from './audiohandler';
import Replyembed from "../components/replyembed";


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
            interaction.reply({ embeds: [Replyembed.build({ title: 'This genre is not implemented yet!', isError: true })], ephemeral: true }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }

        await interaction.reply({ embeds: [Replyembed.build({ title: 'Loading stream...' })] });

        const connection = AudioHandler.connectToVoiceChannel(channelId, guildId, guild.voiceAdapterCreator);
        const audioRource = AudioHandler.loadResource(url);
        AudioHandler.play(guildId, audioRource);

        const audioData = AudioHandler.getData(guildId);
        if (!audioData) {
            interaction.editReply({ embeds: [Replyembed.build({ title: 'OOPS, an error occured!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
            AudioHandler.stop(guildId);
            return;
        }

        connection.subscribe(audioData.player);
        interaction.editReply({ embeds: [Replyembed.build({ title: 'Playing...', color: 'Green' })] }).then(message => setTimeout(() => message.delete(), 2500));
        return;
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'play_button') {
            const audioData = AudioHandler.getData(guildId);
            if (!audioData || !audioData.resource) {
                interaction.reply({ embeds: [Replyembed.build({ title: 'Please select a genre to play!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }

            await interaction.reply({ embeds: [Replyembed.build({ title: 'Loading stream...' })] });

            const connection = AudioHandler.connectToVoiceChannel(channelId, guildId, guild.voiceAdapterCreator);
            AudioHandler.play(guildId, audioData.resource);
            connection.subscribe(audioData.player);

            interaction.reply({ embeds: [Replyembed.build({ title: '▶', color: 'Green' })] }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (interaction.customId === 'pause_button') {
            const paused = AudioHandler.pause(guildId);
            if (!paused) {
                interaction.reply({ embeds: [Replyembed.build({ title: 'OOPS, an error occured!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }

            interaction.reply({ embeds: [Replyembed.build({ title: '⏸', color: 'Grey' })] }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (interaction.customId === 'stop_button') {
            const stopped = AudioHandler.stop(guildId);
            if (!stopped) return;

            interaction.reply({ embeds: [Replyembed.build({ title: '⏹', color: 'Red' })] }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (interaction.customId === 'leave_button') {
            const connection = getVoiceConnection(guildId);
            if (!connection) {
                interaction.reply({ embeds: [Replyembed.build({ title: 'I am in not voicechannel!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }

            AudioHandler.stop(guildId);
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