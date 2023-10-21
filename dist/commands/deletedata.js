"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const databasehandler_1 = __importDefault(require("../handler/databasehandler"));
const replyembed_1 = __importDefault(require("../components/replyembed"));
const command = new discord_js_1.SlashCommandBuilder()
    .setName('deletedata')
    .setDescription('Deletes all of your saved data globally (on all servers)!');
async function execute(client, interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply({ embeds: [replyembed_1.default.build({ title: "This command can only be used inside of servers!", isError: true })] });
        return;
    }
    const user = interaction.user;
    const docs = await databasehandler_1.default.PlayTime.find({}).exec();
    let success = true;
    docs.forEach((document) => {
        document.updateOne({ $pull: { users: { id: user.id } } }, { multi: true }).exec()
            .then(() => success = success && true)
            .catch(() => success = success && false);
    });
    if (success) {
        interaction.reply({ embeds: [replyembed_1.default.build({ title: "Your data was deleted successfully!", color: 'Green' })], ephemeral: true })
            .then((message) => setTimeout(() => message.delete().catch(() => { }), 3000));
        return;
    }
    interaction.reply({ embeds: [replyembed_1.default.build({ title: "Your data could not be deleted completely!\nTry again later!", isError: true })], ephemeral: true })
        .then((message) => setTimeout(() => message.delete().catch(() => { }), 5000));
}
exports.default = {
    command: command,
    execute: execute
};
