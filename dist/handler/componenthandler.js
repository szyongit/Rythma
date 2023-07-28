"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const data_1 = __importDefault(require("../data"));
const audiohandler_1 = __importDefault(require("./audiohandler"));
const replyembed_1 = __importDefault(require("../components/replyembed"));
function getVoiceState(interaction) {
    const data = { data: { channelId: "", guildId: "", voiceAdapter: undefined }, isConnected: false, isError: false };
    const voiceChannelConnection = interaction.member.voice;
    data.isConnected = (voiceChannelConnection !== null || voiceChannelConnection !== undefined);
    if (!voiceChannelConnection)
        return data;
    const guild = interaction.guild;
    if (!guild) {
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
async function handle(client, interaction) {
    if (interaction.isStringSelectMenu()) {
        const voiceState = getVoiceState(interaction);
        if (!voiceState.isConnected) {
            interaction.reply({ embeds: [replyembed_1.default.build({ title: 'You have to be connected to a voice channel!', isError: true })], ephemeral: true });
            return;
        }
        if (voiceState.isError) {
            interaction.reply({ embeds: [replyembed_1.default.build({ title: 'OOPS, an error occured!', isError: true })], ephemeral: true });
            return;
        }
        if (interaction.customId !== 'genre_selector')
            return;
        let value = "";
        interaction.values.forEach((loopValue) => value = loopValue);
        if (value === 'none') {
            audiohandler_1.default.stop(voiceState.data.guildId);
            interaction.reply({ embeds: [replyembed_1.default.build({ title: 'Stopped playing!', color: 'Red' })], ephemeral: true }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        const url = data_1.default.channelsMap.get(value);
        if (!url) {
            interaction.reply({ embeds: [replyembed_1.default.build({ title: 'This genre is not implemented yet!', isError: true })], ephemeral: true }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (!interaction.guild) {
            interaction.reply({ embeds: [replyembed_1.default.build({ title: 'OOPS, an error occured!', isError: true })], ephemeral: true });
            return;
        }
        await interaction.reply({ embeds: [replyembed_1.default.build({ title: '•••' })] });
        const connection = audiohandler_1.default.connectToVoiceChannel(voiceState.data.channelId, voiceState.data.guildId, interaction.guild.voiceAdapterCreator);
        const audioRource = audiohandler_1.default.loadResource(url);
        audiohandler_1.default.play(voiceState.data.guildId, audioRource);
        const audioData = audiohandler_1.default.getData(voiceState.data.guildId);
        if (!audioData) {
            interaction.editReply({ embeds: [replyembed_1.default.build({ title: 'OOPS, an error occured!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
            audiohandler_1.default.stop(voiceState.data.guildId);
            return;
        }
        connection.subscribe(audioData.player);
        interaction.editReply({ embeds: [replyembed_1.default.build({ title: '▶', color: 'Green' })] }).then(message => setTimeout(() => message.delete(), 2500));
        return;
    }
    if (interaction.isButton()) {
        const voiceState = getVoiceState(interaction);
        if (!voiceState.isConnected) {
            interaction.reply({ embeds: [replyembed_1.default.build({ title: 'You have to be connected to a voice channel!', isError: true })], ephemeral: true });
            return;
        }
        if (voiceState.isError) {
            interaction.reply({ embeds: [replyembed_1.default.build({ title: 'OOPS, an error occured!', isError: true })], ephemeral: true });
            return;
        }
        if (interaction.customId === 'play_button') {
            const audioData = audiohandler_1.default.getData(voiceState.data.guildId);
            if (!audioData || !audioData.resource) {
                interaction.reply({ embeds: [replyembed_1.default.build({ title: 'Please select a genre to play!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }
            if (!interaction.guild) {
                interaction.reply({ embeds: [replyembed_1.default.build({ title: 'OOPS, an error occured!', isError: true })], ephemeral: true });
                return;
            }
            await interaction.reply({ embeds: [replyembed_1.default.build({ title: 'Loading stream...' })] });
            const connection = audiohandler_1.default.connectToVoiceChannel(voiceState.data.channelId, voiceState.data.guildId, interaction.guild.voiceAdapterCreator);
            audiohandler_1.default.play(voiceState.data.guildId, audioData.resource);
            connection.subscribe(audioData.player);
            interaction.editReply({ embeds: [replyembed_1.default.build({ title: '▶', color: 'Green' })] }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (interaction.customId === 'pause_button') {
            const paused = audiohandler_1.default.pause(voiceState.data.guildId);
            if (!paused) {
                interaction.reply({ embeds: [replyembed_1.default.build({ title: 'OOPS, an error occured!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }
            interaction.reply({ embeds: [replyembed_1.default.build({ title: '⏸', color: 'Grey' })] }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (interaction.customId === 'stop_button') {
            const stopped = audiohandler_1.default.stop(voiceState.data.guildId);
            if (!stopped)
                return;
            interaction.reply({ embeds: [replyembed_1.default.build({ title: '⏹', color: 'Red' })] }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
        if (interaction.customId === 'leave_button') {
            const connection = (0, voice_1.getVoiceConnection)(voiceState.data.guildId);
            if (!connection) {
                interaction.reply({ embeds: [replyembed_1.default.build({ title: 'I am in no voicechannel!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
                return;
            }
            audiohandler_1.default.stop(voiceState.data.guildId);
            connection.disconnect();
            connection.destroy();
            interaction.reply({ embeds: [replyembed_1.default.build({ title: 'I left the voicechannel!' })] }).then(message => setTimeout(() => message.delete(), 2500));
            return;
        }
    }
}
exports.default = {
    handle: handle
};
