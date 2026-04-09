const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');
const UserInvite = require('../../models/UserInvite');

module.exports = {
    name: 'removeinvites',
    description: 'Remove invites from a member',
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
                embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.cross} Usage: \`removeinvites @user amount\``)]
            });
        }

        let data = await UserInvite.findOne({ guild: message.guild.id, user: member.id });
        if (!data) {
            data = await UserInvite.create({ guild: message.guild.id, user: member.id, invites: 0 });
        }

        data.invites = Math.max(0, data.invites - amount);
        await data.save();

        message.channel.send({
            embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.tick} Removed **${amount}** invites from ${member}. They now have **${data.invites}** invites.`)]
        });
    }
};
