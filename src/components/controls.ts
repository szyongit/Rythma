import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import data from '../data';

const embed = new EmbedBuilder();
embed.setTitle("Rythma Radio Player (BETA)");
embed.setDescription("powered by https://ilovemusic.de/\nThe free german internet radio!");
embed.setColor('DarkPurple');

const selectMenuActionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
const selectMenu = new StringSelectMenuBuilder()
selectMenu.setCustomId('genre_selector')
selectMenu.setPlaceholder('Select a genre')
selectMenu.addOptions(data.optionsArray);
selectMenuActionRow.addComponents(selectMenu);


const buttonActionRow = new ActionRowBuilder<ButtonBuilder>();
const playButton = new ButtonBuilder();
playButton.setStyle(ButtonStyle.Success);
playButton.setLabel("▶");
playButton.setCustomId("play_button");

const pauseButton = new ButtonBuilder();
pauseButton.setStyle(ButtonStyle.Secondary);
pauseButton.setLabel("⏸");
pauseButton.setCustomId("pause_button");

const stopButton = new ButtonBuilder();
stopButton.setStyle(ButtonStyle.Danger);
stopButton.setLabel("⏹");
stopButton.setCustomId("stop_button");

const leaveButton = new ButtonBuilder();
leaveButton.setStyle(ButtonStyle.Primary);
leaveButton.setLabel("🚪");
leaveButton.setCustomId("leave_button");

buttonActionRow.setComponents(playButton, pauseButton, stopButton, leaveButton);

export default {
    embed: [embed.toJSON()],
    components: [buttonActionRow.toJSON(), selectMenuActionRow.toJSON()]
}