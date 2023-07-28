"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const audiohandler_1 = __importDefault(require("../handler/audiohandler"));
const replyembed_1 = __importDefault(require("../components/replyembed"));
const command = new discord_js_1.SlashCommandBuilder()
    .setName('leave')
    .setDescription('Stops the radio and leaves the voicechannel!');
async function execute(client, interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply({ content: "OOPS, AN ERROR OCCURED!" });
        return;
    }
    const connection = (0, voice_1.getVoiceConnection)(guildId);
    if (!connection) {
        interaction.reply({ embeds: [replyembed_1.default.build({ title: 'I am in no voicechannel!', isError: true })] }).then(message => setTimeout(() => message.delete(), 2500));
        return;
    }
    audiohandler_1.default.stop(guildId);
    connection.disconnect();
    connection.destroy();
    interaction.reply({ embeds: [replyembed_1.default.build({ title: 'I left the voicechannel!' })] }).then(message => setTimeout(() => message.delete(), 2500));
    return;
}
exports.default = {
    command: command,
    execute: execute
};
