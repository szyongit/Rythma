import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';

import ReplyEmbed from '../components/replyembed';
import DatabaseHandler from '../handler/databasehandler';

const command = new SlashCommandBuilder()
.setName('leaderboard')
.setDescription('Shows the leaderboard of active listeners for this guild')

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

    type ListeningTime = {id:string, time:number};
    let data:ListeningTime[] = [];

    const now = Date.now();

    doc.users.forEach((elements) => {
        data.push({id:elements.id, time:((elements.time || 0) + (now - (elements.joinTime || now)))});
    });

    data = data.sort((a, b) => b.time - a.time);
    let userIndex = data.findIndex((element) => element.id == interaction.user.id);

    let string:string = "";
    for(let i = userIndex - 3; i < userIndex + 3; i++) {
        console.log(i + ": " + data[i]);
        if(!data[i]) continue;

        if(i === userIndex) {
            string += "\n";
        }

        const user = `<@${data[i].id}> `;
        const timeString = `${Math.floor(data[i].time/1000/60/60)} Hours, ${(Math.floor(data[i].time/1000/60)%60)} Minutes, ${(Math.floor(data[i].time/1000) % 60)} Seconds`;
        string += `${i+1}) ${user} - ${timeString}\n`;

        if(i === userIndex) {
            string += "\n";
        }
    }

    interaction.reply({ embeds: [ReplyEmbed.build({
        title:"Leaderboard", 
        message:string,
        thumbnailURL:client.user?.avatarURL({size:64}),
        timestamp:true
    })]}).then((message) => {
        setTimeout(() => message.delete(), 3500);
    });
}

export default {
    command: command,
    execute: execute
}