import {ChatInputCommandInteraction, Client, SlashCommandBuilder} from 'discord.js';

import Controls from '../components/controls'

const command = new SlashCommandBuilder()
.setName('controls')
.setDescription('Shows controls')
async function execute(client:Client, interaction:ChatInputCommandInteraction) {
    interaction.reply({embeds:Controls.embed, components:Controls.components});
}

export default {
    command:command,
    execute:execute
}