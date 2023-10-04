"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const replyembed_1 = __importDefault(require("../components/replyembed"));
const data_1 = __importDefault(require("../data"));
const command = new discord_js_1.SlashCommandBuilder()
    .setName('playtime')
    .setDescription('Shows the total playtime of this guild!');
async function execute(client, interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply({ embeds: [replyembed_1.default.build({ title: "OOPS, an error occurred!", isError: true })], ephemeral: true });
        return;
    }
    const playTimeData = data_1.default.playTimeMap.get(guildId);
    const time = (playTimeData?.time || 0) + (Date.now() - (playTimeData?.lastStart || Date.now()));
    const guildThumbnail = interaction.guild?.iconURL({ size: 128 });
    interaction.reply({ embeds: [replyembed_1.default.build({
                title: interaction.guild?.name || "Guild",
                message: `Playtime:\n${(time / 1000 / 60 / 60 / 24).toFixed(0)} Days, ${((time / 1000 / 60 / 60) % 60).toFixed(0)} Hours, ${((time / 1000 / 60) % 60).toFixed(0)} Minutes, ${((time / 1000) % 60).toFixed(0)} Seconds`,
                thumbnailURL: guildThumbnail
            })], ephemeral: true });
}
exports.default = {
    command: command,
    execute: execute
};
