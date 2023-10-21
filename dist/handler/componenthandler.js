"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const data_1 = __importDefault(require("../data"));
const audiohandler_1 = __importDefault(require("./audiohandler"));
const replyembed_1 = __importDefault(require("../components/replyembed"));
const voicestatehandler_1 = __importDefault(require("./voicestatehandler"));
async function handle(client, interaction) {
    const guild = interaction.guild;
    if (!guild) {
        return;
    }
    const voiceConnection = interaction.member.voice;
    const voiceChannel = voiceConnection.channel;
    if (!voiceChannel || !voiceChannel.id) {
        if (!interaction.isStringSelectMenu() && !interaction.isButton())
            return;
        interaction.reply({ embeds: [replyembed_1.default.build({ title: "You have to be in a voice channel!", isError: true })] })
            .then((message) => setTimeout(() => message.delete().catch(() => { }), 5000));
        return;
    }
    const guildId = interaction.guildId;
    if (!guildId) {
        return;
    }
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId !== 'genre_selector')
            return;
        let value = "";
        interaction.values.forEach((loopValue) => value = loopValue);
        if (value === 'none') {
            audiohandler_1.default.stop(guildId);
            interaction.reply({ embeds: [replyembed_1.default.build({ title: 'Stopped playing!', color: 'Red' })], ephemeral: true }).then(message => setTimeout(() => message.delete().catch(() => { }), 2500));
            return;
        }
        const url = data_1.default.channelsMap.get(value);
        if (!url) {
            interaction.reply({ embeds: [replyembed_1.default.build({ title: 'This genre is not implemented yet!', isError: true })], ephemeral: true }).then(message => setTimeout(() => message.delete().catch(() => { }), 2500));
            return;
        }
        await interaction.reply({ embeds: [replyembed_1.default.build({ title: '•••' })] });
        const connection = audiohandler_1.default.connectToVoiceChannel(voiceChannel.id, guildId, guild.voiceAdapterCreator);
        audiohandler_1.default.play(guildId, url);
        const audioData = audiohandler_1.default.getData(guildId);
        if (!audioData) {
            interaction.editReply({ embeds: [replyembed_1.default.build({ title: 'OOPS, an error occured!', isError: true })] }).then(message => setTimeout(() => message.delete().catch(() => { }), 2500));
            audiohandler_1.default.stop(guildId);
            return;
        }
        connection.subscribe(audioData.player);
        interaction.editReply({ embeds: [replyembed_1.default.build({ title: '▶', color: 'Green' })] }).then(message => setTimeout(() => message.delete().catch(() => { }), 2500));
        return;
    }
    if (interaction.isButton()) {
        if (interaction.customId === 'play_button') {
            const audioData = audiohandler_1.default.getData(guildId);
            if (!audioData || !audioData.resource) {
                interaction.reply({ embeds: [replyembed_1.default.build({ title: 'Please select a genre to play!', isError: true })] }).then(message => setTimeout(() => message.delete().catch(() => { }), 2500));
                return;
            }
            await interaction.reply({ embeds: [replyembed_1.default.build({ title: '•••' })] });
            const connection = audiohandler_1.default.connectToVoiceChannel(voiceChannel.id, guildId, guild.voiceAdapterCreator);
            audiohandler_1.default.play(guildId, audioData.resource);
            connection.subscribe(audioData.player);
            voiceChannel.members.forEach(async (member) => {
                if (member.id === client.user?.id)
                    return;
                await voicestatehandler_1.default.saveJoinTime(member.voice);
            });
            interaction.editReply({ embeds: [replyembed_1.default.build({ title: '▶', color: 'Green' })] }).then(message => setTimeout(() => message.delete().catch(() => { }), 2500));
            return;
        }
        if (interaction.customId === 'pause_button') {
            const paused = audiohandler_1.default.pause(guildId);
            if (!paused) {
                interaction.reply({ embeds: [replyembed_1.default.build({ title: '⏸', color: 'Grey' })] }).then(message => setTimeout(() => message.delete().catch(() => { }), 2500));
                return;
            }
            voiceChannel.members.forEach(async (member) => {
                if (member.id === client.user?.id)
                    return;
                await voicestatehandler_1.default.saveListeningTime(member.voice);
            });
            interaction.reply({ embeds: [replyembed_1.default.build({ title: '⏸', color: 'Grey' })] }).then(message => setTimeout(() => message.delete().catch(() => { }), 2500));
            return;
        }
        if (interaction.customId === 'stop_button') {
            const stopped = audiohandler_1.default.stop(guildId);
            if (!stopped) {
                interaction.reply({ embeds: [replyembed_1.default.build({ title: '⏹', color: 'Red' })] }).then(message => setTimeout(() => message.delete().catch(() => { }), 2500));
                return;
            }
            voiceChannel.members.forEach(async (member) => {
                if (member.id === client.user?.id)
                    return;
                await voicestatehandler_1.default.saveListeningTime(member.voice);
            });
            interaction.reply({ embeds: [replyembed_1.default.build({ title: '⏹', color: 'Red' })] }).then(message => setTimeout(() => message.delete().catch(() => { }), 2500));
            return;
        }
        if (interaction.customId === 'leave_button') {
            const connection = (0, voice_1.getVoiceConnection)(guildId);
            if (!connection) {
                interaction.reply({ embeds: [replyembed_1.default.build({ title: 'I\'m in no voicechannel!', isError: true })] }).then(message => setTimeout(() => message.delete().catch(() => { }), 2500));
                return;
            }
            audiohandler_1.default.stop(guildId);
            connection.disconnect();
            connection.destroy();
            interaction.reply({ embeds: [replyembed_1.default.build({ title: ':wave:' })] }).then(message => setTimeout(() => message.delete().catch(() => { }), 2500));
            return;
        }
    }
}
exports.default = {
    handle: handle
};
