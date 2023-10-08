"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const replyembed_1 = __importDefault(require("../components/replyembed"));
const databasehandler_1 = __importDefault(require("../handler/databasehandler"));
const command = new discord_js_1.SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Shows the leaderboard of active listeners for this guild');
async function execute(client, interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply({ embeds: [replyembed_1.default.build({ title: "This command can only be used inside of servers!", isError: true })] })
            .then(message => setTimeout(() => message.delete(), 3000));
        ;
        return;
    }
    const doc = await databasehandler_1.default.PlayTime.findOne({ guild: guildId }).exec();
    if (!doc) {
        interaction.reply({ embeds: [replyembed_1.default.build({ title: "Could not load data from database!", isError: true })], ephemeral: true });
        return;
    }
    let data = [];
    if (doc.users.length <= 0) {
        interaction.reply({ embeds: [replyembed_1.default.build({ title: "No user has listened yet!", isError: true })], ephemeral: true });
        return;
    }
    const now = Date.now();
    doc.users.forEach((elements) => {
        data.push({ id: elements.id, time: ((elements.time || 0) + (now - (elements.joinTime || now))) });
    });
    data = data.sort((a, b) => b.time - a.time);
    let userIndex = data.findIndex((element) => element.id == interaction.user.id);
    let string = "";
    for (let i = userIndex - 3; i < userIndex + 3; i++) {
        if (!data[i])
            continue;
        if (i === userIndex) {
            string += "\n";
        }
        const user = `<@${data[i].id}> `;
        const timeString = `${Math.floor(data[i].time / 1000 / 60 / 60)} Hours, ${(Math.floor(data[i].time / 1000 / 60) % 60)} Minutes, ${(Math.floor(data[i].time / 1000) % 60)} Seconds`;
        string += `${i + 1}) ${user} - ${timeString}\n`;
        if (i === userIndex) {
            string += "\n";
        }
    }
    interaction.reply({ embeds: [replyembed_1.default.build({
                title: "Leaderboard",
                message: string,
                thumbnailURL: client.user?.avatarURL({ size: 64 }),
                timestamp: true
            })] }).then((message) => {
        setTimeout(() => message.delete().catch(() => { }), 5000);
    });
}
exports.default = {
    command: command,
    execute: execute
};
