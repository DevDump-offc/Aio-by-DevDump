const { MessageEmbed } = require('discord.js');
const UserInvite = require('../../models/UserInvite');

module.exports = {
    name: 'inviteinfo',
    description: 'Get detailed invite info for a member',
    category: 'serveru',
    premium: false,
    subcommand: [],

    run: async (client, message, args) => {
        const e = client.emoji;
        const member = message.mentions.members.first() || message.member;
        const data = await UserInvite.findOne({ guild: message.guild.id, user: member.id });

        const embed = new MessageEmbed()
            .setColor(client.color)
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setTitle(`${e.server_utility} Invite Information`)
            .addFields(
                { name: `${e.tick} Total Invites`, value: `**${data?.invites || 0}**`, inline: true },
                { name: `${e.cross} Fake Invites`, value: `**${data?.fake || 0}**`, inline: true },
                { name: `${e.dot} Leaves`, value: `**${data?.leaves || 0}**`, inline: true }
            )
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
