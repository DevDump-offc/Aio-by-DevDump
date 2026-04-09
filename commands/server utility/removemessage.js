const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');
const UserStat = require('../../models/UserStat');

module.exports = {
    name: 'removemessage',
    aliases: ['removemsg'],
    description: 'Remove messages from a member',
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
                embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.cross} Usage: \`removemessage @user amount\``)]
            });
        }

        let data = await UserStat.findOne({ guild: message.guild.id, user: member.id });
        if (!data) {
            data = await UserStat.create({ guild: message.guild.id, user: member.id, messages: 0 });
        }

        data.messages = Math.max(0, data.messages - amount);
        await data.save();

        message.channel.send({
            embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.tick} Removed **${amount}** messages from ${member}. They now have **${data.messages}** messages.`)]
        });
    }
};
