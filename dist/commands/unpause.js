"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const audiohandler_1 = __importDefault(require("../handler/audiohandler"));
const command = new discord_js_1.SlashCommandBuilder()
    .setName('unpause')
    .setDescription('Pauses the radio');
async function execute(client, interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply({ content: "OOPS, AN ERROR OCCURED!" });
        return;
    }
    audiohandler_1.default.unpause(guildId);
    interaction.reply({ content: "Stopped playing song" });
}
exports.default = {
    command: command,
    execute: execute
};
