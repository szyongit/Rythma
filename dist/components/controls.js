"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const embed = new discord_js_1.EmbedBuilder();
embed.setTitle("Rythma Radio Player (BETA)");
embed.setDescription("powered by https://ilovemusic.de/\nThe free german internet radio!");
embed.setColor('DarkPurple');
const selectMenuActionRow = new discord_js_1.ActionRowBuilder();
const selectMenu = new discord_js_1.StringSelectMenuBuilder();
selectMenu.setCustomId('genre_selector');
selectMenu.setPlaceholder('Select a genre');
selectMenu.addOptions({ label: 'POP', value: 'newpop' }, { label: 'ROCK', value: 'rock' }, { label: 'HIPHOP', value: 'hiphop' }, { label: 'US RAP ONLY', value: 'usrap' }, { label: 'HARDSTYLE', value: 'hardstlye' }, { label: 'CHILLHOP', value: 'chillhop' }, { label: 'DANCE', value: 'dance' }, { label: 'CREATEST HITS', value: 'greatesthits' }, { label: '2010+ THROWBACKS', value: '2010s' }, { label: '2000+ THROWBACKS', value: '2000s' }, { label: '1990+ THROWBACKS', value: '90s' }, { label: 'NIGHT CLUB', value: 'club' }, { label: 'BEACH VIBEZ', value: 'beach' }, { label: 'CHRISTMAS', value: 'christmas' }, { label: 'TRASHPOP', value: 'trashpop' }, { label: 'TOP 100 CHARTS GERMANY', value: 'chartsgermany' }, { label: 'GERMAN SCHLAGER', value: 'germanschlager' }, { label: 'GERMAN RAP', value: 'germanrap' }, { label: 'NONE', value: 'none' });
selectMenuActionRow.addComponents(selectMenu);
const buttonActionRow = new discord_js_1.ActionRowBuilder();
const playButton = new discord_js_1.ButtonBuilder();
playButton.setStyle(discord_js_1.ButtonStyle.Success);
playButton.setLabel("▶");
playButton.setCustomId("play_button");
const pauseButton = new discord_js_1.ButtonBuilder();
pauseButton.setStyle(discord_js_1.ButtonStyle.Danger);
pauseButton.setLabel("⏸");
pauseButton.setCustomId("pause_button");
const stopButton = new discord_js_1.ButtonBuilder();
stopButton.setStyle(discord_js_1.ButtonStyle.Secondary);
stopButton.setLabel("⏹");
stopButton.setCustomId("stop_button");
const leaveButton = new discord_js_1.ButtonBuilder();
leaveButton.setStyle(discord_js_1.ButtonStyle.Secondary);
leaveButton.setLabel("🚪");
leaveButton.setCustomId("leave_button");
buttonActionRow.setComponents(playButton, pauseButton, stopButton, leaveButton);
exports.default = {
    embed: [embed.toJSON()],
    components: [buttonActionRow.toJSON(), selectMenuActionRow.toJSON()]
};
