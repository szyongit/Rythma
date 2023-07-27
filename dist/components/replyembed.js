"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
function buildEmbed(message, title, isError, timestamp) {
    const embed = new discord_js_1.EmbedBuilder();
    embed.setDescription(message);
    embed.setTitle(title || null);
    embed.setColor((isError ? 'Red' : 'Purple'));
    if (timestamp)
        embed.setTimestamp();
    return embed;
}
exports.default = {
    buildEmbed: buildEmbed
};
