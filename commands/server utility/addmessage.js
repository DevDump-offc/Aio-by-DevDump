const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');
const UserStat = require('../../models/UserStat');

module.exports = {
    name: 'addmessage',
    aliases: ['addmsg'],
    description: 'Add messages to a member',
    category: 'serveru',
    premium: false,
    subcommand: [],

    run: async (client, message, args) => {
        const e = client.emoji;
        const isSpecialMember = config.boss.includes(message.author.id);
        if (!isSpecialMember && !message.member.permissions.has('ADMINISTRATOR')) {
            return message.channel.send({
                embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.cross} You don't have permission.`)]
            });
        }

        const member = message.mentions.members.first();
        const amount = parseInt(args[1]);

        if (!member || isNaN(amount)) {
            return message.channel.send({
                embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.cross} Usage: \`addmessage @user amount\``)]
            });
        }

        const data = await UserStat.findOneAndUpdate(
            { guild: message.guild.id, user: member.id },
            { $inc: { messages: amount } },
            { upsert: true, new: true }
        );

        message.channel.send({
            embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.tick} Added **${amount}** messages to ${member}. They now have **${data.messages}** messages.`)]
        });
    }
};
