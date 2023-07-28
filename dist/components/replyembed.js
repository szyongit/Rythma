"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
function build(options) {
    const embed = new discord_js_1.EmbedBuilder();
    embed.setDescription(options.message || null);
    embed.setTitle(options.title || null);
    embed.setColor(options.color ? options.color : (options.isError ? 'DarkRed' : 'DarkPurple'));
    if (options.timestamp)
        embed.setTimestamp();
    return embed;
}
exports.default = {
    build: build
};