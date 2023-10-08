"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const replyembed_1 = __importDefault(require("../components/replyembed"));
const databasehandler_1 = __importDefault(require("../handler/databasehandler"));
const command = new discord_js_1.SlashCommandBuilder()
    .setName('playtime')
    .setDescription('Shows the total playtime for this guild!');
async function execute(client, interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply({ embeds: [replyembed_1.default.build({ title: "This command can only be used inside of servers!", isError: true })] });
        return;
    }
    const doc = await databasehandler_1.default.PlayTime.findOne({ guild: guildId }).exec();
    if (!doc) {
        interaction.reply({ embeds: [replyembed_1.default.build({ title: "Could not load data from database!", isError: true })], ephemeral: true });
        return;
    }
    const now = Date.now();
    const isPlaying = doc.playing === true;
    const time = (doc.time || 0) + (isPlaying ? (now - (doc.lastStart || now)) : 0);
    const guildThumbnail = interaction.guild?.iconURL({ size: 128 }) || client.user?.avatarURL({ size: 128 });
    interaction.reply({ embeds: [replyembed_1.default.build({
                title: interaction.guild?.name || "Guild",
                message: `Playtime:\n${(Math.floor(time / 1000 / 60 / 60 / 24))} Days, ${((Math.floor(time / 1000 / 60 / 60) % 60))} Hours, ${((Math.floor(time / 1000 / 60) % 60))} Minutes, ${(Math.floor((time / 1000) % 60))} Seconds`,
                thumbnailURL: guildThumbnail
            })] }).then((message) => {
        setTimeout(() => message.delete().catch(() => { }), 5000);
    });
}
exports.default = {
    command: command,
    execute: execute
};
