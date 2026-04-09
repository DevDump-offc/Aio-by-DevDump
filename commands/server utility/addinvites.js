const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');
const UserInvite = require('../../models/UserInvite');

module.exports = {
    name: 'addinvites',
    description: 'Add invites to a member',
    category: 'serveru',
    premium: false,
    subcommand: [],

    run: async (client, message, args) => {
        const e = client.emoji;
        const isSpecialMember = config.boss.includes(message.author.id);
        if (!isSpecialMember && !message.member.permissions.has('ADMINISTRATOR')) return;

        const member = message.mentions.members.first();
        const amount = parseInt(args[1]);

        if (!member || isNaN(amount)) {
            return message.channel.send({
                embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.cross} Usage: \`addinvites @user amount\``)]
            });
        }

        const data = await UserInvite.findOneAndUpdate(
            { guild: message.guild.id, user: member.id },
            { $inc: { invites: amount } },
            { upsert: true, new: true }
        );

        message.channel.send({
            embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.tick} Added **${amount}** invites to ${member}. They now have **${data.invites}** invites.`)]
        });
    }
};
