import { EmbedBuilder } from 'discord.js';

function buildEmbed(message:string, title?:string, isError?:boolean, timestamp?:boolean):EmbedBuilder {
    const embed = new EmbedBuilder();
    embed.setDescription(message);
    embed.setTitle(title || null);
    embed.setColor((isError ? 'Red' : 'Purple'));
    if(timestamp) embed.setTimestamp();

    return embed;
}

export default {
    buildEmbed:buildEmbed
}