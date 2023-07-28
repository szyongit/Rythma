import { ColorResolvable, EmbedBuilder, StringMappedInteractionTypes } from 'discord.js';

function build(options:{title?:string, message?:string, isError?:boolean, color?:ColorResolvable, timestamp?:boolean}):EmbedBuilder {
    const embed = new EmbedBuilder();
    embed.setDescription(options.message || null);
    embed.setTitle(options.title || null);
    embed.setColor(options.color ? options.color : (options.isError ? 'DarkRed' : 'DarkPurple'));
    if(options.timestamp) embed.setTimestamp();

    return embed;
}

export default {
    build:build
}