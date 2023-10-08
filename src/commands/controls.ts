import {ChannelType, ChatInputCommandInteraction, Client, SlashCommandBuilder, TextChannel} from 'discord.js';

import Controls from '../components/controls'
import ReplyEmbed from '../components/replyembed';
import DatabasehHandler from '../handler/databasehandler';
import Data from '../data';

const command = new SlashCommandBuilder()
.setName('controls')
.setDescription('Display the controls in the specified channel!')
.addChannelOption(channel => 
    channel
    .addChannelTypes(ChannelType.GuildText)
    .setName("channel")
    .setDescription("The channel to display the controls in")
    .setRequired(true)    
)
.addBooleanOption(boolean => 
    boolean
    .setRequired(false)
    .setName("lock")
    .setDescription("Lock the channel for messages after the controls")
)

async function execute(client:Client, interaction:ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if(!guildId) {
        interaction.reply({ embeds: [ReplyEmbed.build({title:"This command can only be used inside of servers!", isError:true})]})
        .then(message => setTimeout(() => message.delete(), 3000));
        return;
    }

    const channel = interaction.options.getChannel("channel", true);
    const lockChannel = interaction.options.getBoolean("lock");

    const doc = await DatabasehHandler.ControlsData.findOne({guild:guildId}).exec();
    if(doc) {
        if(!doc.message) {
            interaction.reply({ embeds: [ReplyEmbed.build({title:"Could not delete previous message", isError:true})]})
            .then(message => setTimeout(() => message.delete(), 3000));
        } else {
            const prevChannel = await client.channels.fetch(doc.channel || "");
            if(prevChannel?.type === ChannelType.GuildText) {
                await prevChannel.messages.delete(doc.message).catch(() => {
                    interaction.reply({ embeds: [ReplyEmbed.build({title:"Could not delete previous message", isError:true})]})
                    .then(message => setTimeout(() => message.delete(), 3000));
                });
            }
        }
    }

    const newChannel = <TextChannel> await client.channels.fetch(channel.id);
    let message = await newChannel.send({embeds:Controls.embed, components:Controls.components});

    if(!message) {
        if(interaction.replied) {
            await interaction.editReply({embeds:[ReplyEmbed.build({title:"Could not display controls inside of <#" + newChannel.id + ">!", isError:true})]})
            .then(message => setTimeout(() => message.delete(), 3000));;
        } else {
            await interaction.reply({embeds:[ReplyEmbed.build({title:"Could not display controls inside of <#" + newChannel.id + ">!", isError:true})]})
            .then(message => setTimeout(() => message.delete(), 3000));;
        }
    }   

    const locked = ((lockChannel == undefined) ? (!doc?.lock ? false : doc.lock) : lockChannel);
    await DatabasehHandler.ControlsData.updateOne({guild:guildId}, {channel:channel.id, message:message.id, lock:locked}, {upsert:true}).exec()
    .then(() => {
        Data.setLockedChannel((!locked ? undefined : newChannel.id));
        if(interaction.replied) {
            interaction.editReply({embeds:[ReplyEmbed.build({title:"Controls are now shown inside of <#" + newChannel.id + ">!"})]})
            .then(message => setTimeout(() => message.delete(), 3000));;
        } else {
            interaction.reply({embeds:[ReplyEmbed.build({title:"Controls are now shown inside of <#" + newChannel.id + ">!"})]})
            .then(message => setTimeout(() => message.delete(), 3000));;
        }
    }).catch(() => {
        if(interaction.replied) {
            interaction.editReply({embeds:[ReplyEmbed.build({title:"Error whilst trying to save to database. Please try again.", isError:true})]})
            .then(message => setTimeout(() => message.delete(), 3000));;
        } else {
            interaction.reply({embeds:[ReplyEmbed.build({title:"Error whilst trying to save to database. Please try again.", isError:true})]})
            .then(message => setTimeout(() => message.delete(), 3000));;
        }
    });
}

export default {
    command:command,
    execute:execute
}