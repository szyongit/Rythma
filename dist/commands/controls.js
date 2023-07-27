"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const controls_1 = __importDefault(require("../components/controls"));
const command = new discord_js_1.SlashCommandBuilder()
    .setName('controls')
    .setDescription('Shows controls');
async function execute(client, interaction) {
    interaction.reply({ embeds: controls_1.default.embed, components: controls_1.default.components });
}
exports.default = {
    command: command,
    execute: execute
};
