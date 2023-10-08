import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';

import ReplyEmbed from '../components/replyembed';
import DatabaseHandler from '../handler/databasehandler';

const command = new SlashCommandBuilder()
.setName('playtime')
.setDescription('Shows the total playtime for this guild!')

async function execute(client: Client, interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if(!guildId) {
        interaction.reply({ embeds: [ReplyEmbed.build({title:"This command can only be used inside of servers!", isError:true})]});
        return;
    }

    const doc = await DatabaseHandler.PlayTime.findOne({guild:guildId}).exec();

    if(!doc) {
        interaction.reply({ embeds: [ReplyEmbed.build({title:"Could not load data from database!", isError:true})] , ephemeral:true});
        return;
    }

    const now = Date.now();
    const isPlaying = doc.playing === true;

    const time = (doc.time || 0) + (isPlaying ? (now - (doc.lastStart || now)) : 0);
    const guildThumbnail = interaction.guild?.iconURL({size:128}) || client.user?.avatarURL({size:128});

    interaction.reply({ embeds: [ReplyEmbed.build({
        title:interaction.guild?.name || "Guild",
        message:`Playtime:\n${(Math.floor(time/1000/60/60/24))} Days, ${((Math.floor(time/1000/60/60)%60))} Hours, ${((Math.floor(time/1000/60)%60))} Minutes, ${(Math.floor((time/1000)%60))} Seconds`,
        thumbnailURL:guildThumbnail
    })]}).then((message) => {
        setTimeout(() => message.delete().catch(() => {}), 5000);
    });
}

export default {
    command: command,
    execute: execute
}