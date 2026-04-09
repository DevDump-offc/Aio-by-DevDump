const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');
const UserStat = require('../../models/UserStat');

module.exports = {
    name: 'addvoice',
    description: 'Add voice minutes to a member',
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
                embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.cross} Usage: \`addvoice @user minutes\``)]
            });
        }

        const data = await UserStat.findOneAndUpdate(
            { guild: message.guild.id, user: member.id },
            { $inc: { voiceTime: amount } },
            { upsert: true, new: true }
        );

        message.channel.send({
            embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.tick} Added **${amount}** voice minutes to ${member}. They now have **${data.voiceTime}** minutes.`)]
        });
    }
};
