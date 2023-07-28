import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';

import ReplyEmbed from '../components/replyembed';

const command = new SlashCommandBuilder()
.setName('disclaimers')
.setDescription('Shows some disclaimers!')

async function execute(client: Client, interaction: ChatInputCommandInteraction) {
    const actionRowBuilder = new ActionRowBuilder<ButtonBuilder>();
    actionRowBuilder.addComponents(new ButtonBuilder({ label: 'ilovemusic.de', style: ButtonStyle.Link, url: 'https://ilovemusic.de/' }));
    interaction.reply({ embeds: [ReplyEmbed.build({color:'Red', title:'DISCLAIMER!', message:'With the use of this bot you automatically agree that the developer of this bot is not responsible for any damage done to non NSFW channels or copyright rights.\nThe music is streamed from ilovemusic.de and the developer has no effect on what is streamed!'})] , components:[actionRowBuilder], ephemeral:true});
}

export default {
    command: command,
    execute: execute
}