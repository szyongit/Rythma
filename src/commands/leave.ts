import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

import AudioHandler from '../handler/audiohandler'
import Replyembed from '../components/replyembed';

const command = new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Stops the radio and leaves the voicechannel!')

async function execute(client: Client, interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply({ content: "OOPS, AN ERROR OCCURED!" })
        .then((message) => setTimeout(() => message.delete(), 3000));
        return;
    }

    const connection = getVoiceConnection(guildId);
    if (!connection) {
        interaction.reply({ embeds: [Replyembed.build({ title: 'I am in no voicechannel!', isError: true })] }).then(message => setTimeout(() => message.delete(), 3000));
        return;
    }

    AudioHandler.stop(guildId);
    connection.disconnect();
    connection.destroy();
    interaction.reply({ embeds: [Replyembed.build({ title: 'I left the voicechannel!' })] }).then(message => setTimeout(() => message.delete(), 3000));
    return;
}

export default {
    command: command,
    execute: execute
}