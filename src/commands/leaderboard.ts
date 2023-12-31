import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';

import ReplyEmbed from '../components/replyembed';
import DatabaseHandler from '../handler/databasehandler';

const command = new SlashCommandBuilder()
.setName('leaderboard')
.setDescription('Shows the leaderboard of active listeners for this guild')

async function execute(client: Client, interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if(!guildId) {
        interaction.reply({ embeds: [ReplyEmbed.build({title:"This command can only be used inside of servers!", isError:true})]})
        .then(message => setTimeout(() => message.delete(), 3000));;
        return;
    }

    const doc = await DatabaseHandler.PlayTime.findOne({guild:guildId}).exec();

    type ListeningTime = {id:string, time:number};
    let data:ListeningTime[] = [];

    if(!doc || doc.users.length <= 0) {
        interaction.reply({ embeds: [ReplyEmbed.build({title:"No user has listened yet!", isError:true})] , ephemeral:true});
        return;
    }

    const now = Date.now();

    doc.users.forEach((elements) => {
        data.push({id:elements.id, time:((elements.time || 0) + (now - (elements.joinTime || now)))});
    });

    data = data.sort((a, b) => b.time - a.time);
    let userIndex = data.findIndex((element) => element.id == interaction.user.id);

    let string:string = "";
    for(let i = userIndex - 3; i < userIndex + 3; i++) {
        if(!data[i]) continue;

        if(i === userIndex) {
            string += "\n";
        }

        const index = i+1;
        const indexDisplay = (index === 1 ? ":first_place:" : (index === 2 ? ":second_place:" : (index === 3 ? ":third_place:" : (index + ")")))); 
        const user = `<@${data[i].id}> `;
        const timeString = `${Math.floor(data[i].time/1000/60/60)} Hours, ${(Math.floor(data[i].time/1000/60)%60)} Minutes, ${(Math.floor(data[i].time/1000) % 60)} Seconds`;
        string += `${indexDisplay} ${user} - ${timeString}\n`;

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
        setTimeout(() => message.delete().catch(() => {}), 5000);
    });
}

export default {
    command: command,
    execute: execute
}