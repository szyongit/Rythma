import {ChatInputCommandInteraction, Client, SlashCommandBuilder} from 'discord.js';

import DatabaseHandler from '../handler/databasehandler';
import ReplyEmbed from '../components/replyembed';

const command = new SlashCommandBuilder()
.setName('deletedata')
.setDescription('Deletes all of your saved data globally!');

async function execute(client:Client, interaction:ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if(!guildId) {
        interaction.reply({ embeds: [ReplyEmbed.build({title:"This command can only be used inside of servers!", isError:true})]});
        return;
    }

    const user = interaction.user;
    const docs = await DatabaseHandler.PlayTime.find({}).exec();
    
    let success = true;
    docs.forEach((document) => {
        document.updateOne({$pull: {users: {id:user.id}}}, {multi:true}).exec()
        .then(() => success = success && true)
        .catch(() => success = success && false);
    });

    
    if(success) {
        interaction.reply({embeds:[ReplyEmbed.build({title:"Your data was deleted successfully!", color:'Green'})], ephemeral:true})
        .then((message) => setTimeout(() => message.delete().catch(() => {}), 3000));
        return;
    }

    interaction.reply({embeds:[ReplyEmbed.build({title:"Your data could not be deleted completely!\nTry again later!", isError:true})], ephemeral:true})
    .then((message) => setTimeout(() => message.delete().catch(() => {}), 5000));
}

export default {
    command:command,
    execute:execute
}