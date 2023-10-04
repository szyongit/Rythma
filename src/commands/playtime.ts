import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';

import ReplyEmbed from '../components/replyembed';
import Data from '../data';

const command = new SlashCommandBuilder()
.setName('playtime')
.setDescription('Shows the total playtime of this guild!')

async function execute(client: Client, interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;

    if(!guildId) {
        interaction.reply({ embeds: [ReplyEmbed.build({title:"OOPS, an error occurred!", isError:true})] , ephemeral:true});
        return;
    }

    const playTimeData = Data.playTimeMap.get(guildId);
    const time = (playTimeData?.time || 0) + (Date.now() - (playTimeData?.lastStart || Date.now()));
    const guildThumbnail = interaction.guild?.iconURL({size:128});

    interaction.reply({ embeds: [ReplyEmbed.build({
        title:interaction.guild?.name || "Guild", 
        message:`Playtime:\n${(time/1000/60/60/24).toFixed(0)} Days, ${((time/1000/60/60)%60).toFixed(0)} Hours, ${((time/1000/60)%60).toFixed(0)} Minutes, ${((time/1000)%60).toFixed(0)} Seconds`,
        thumbnailURL:guildThumbnail
    })], ephemeral:true});
}

export default {
    command: command,
    execute: execute
}