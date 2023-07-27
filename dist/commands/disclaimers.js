"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const replyembed_1 = __importDefault(require("../components/replyembed"));
const command = new discord_js_1.SlashCommandBuilder()
    .setName('disclaimers')
    .setDescription('Shows some disclaimers!');
async function execute(client, interaction) {
    const actionRowBuilder = new discord_js_1.ActionRowBuilder();
    actionRowBuilder.addComponents(new discord_js_1.ButtonBuilder({ label: 'ilovemusic.de', style: discord_js_1.ButtonStyle.Link, url: 'https://ilovemusic.de/' }));
    interaction.reply({ embeds: [replyembed_1.default.buildEmbed("With the use of this bot you automatically agree that the developer of this bot is not responsible for any damage done to non NSFW channels or copyright rights.\nThe music is streamed from ilovemusic.de and the developer has no effect on what is streamed!", "DISCLAIMER", true, false)], components: [actionRowBuilder], ephemeral: true });
}
exports.default = {
    command: command,
    execute: execute
};
