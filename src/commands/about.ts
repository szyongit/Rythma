import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';

import ReplyEmbed from '../components/replyembed';

const command = new SlashCommandBuilder()
.setName('about')
.setDescription('Shows informations about the bot!')

async function execute(client: Client, interaction: ChatInputCommandInteraction) {
    const actionRowBuilder = new ActionRowBuilder<ButtonBuilder>();
    actionRowBuilder.addComponents(new ButtonBuilder({ label: 'My GitHub', style: ButtonStyle.Link, url: 'https://github.com/szyongit' }))
    interaction.reply({ embeds: [ReplyEmbed.buildEmbed("Version: 0.1 (beta)\nAuthor: Szyon", "Rythma", false, false)] , components:[actionRowBuilder], ephemeral:true});
}

export default {
    command: command,
    execute: execute
}