import {ChatInputCommandInteraction, Client, SlashCommandBuilder} from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

import Musichandler from '../handler/audiohandler'

const command = new SlashCommandBuilder()
.setName('unpause')
.setDescription('Pauses the radio')

async function execute(client:Client, interaction:ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if(!guildId) {
        interaction.reply({content:"OOPS, AN ERROR OCCURED!"});
        return;
    }

    Musichandler.unpause(guildId);
    interaction.reply({content:"Stopped playing song"});
}

export default {
    command:command,
    execute:execute
}