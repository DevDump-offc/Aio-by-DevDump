const { MessageEmbed } = require('discord.js');
const UserInvite = require('../../models/UserInvite');

module.exports = {
    name: 'inviter',
    description: 'Check your invite stats',
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
            .setTitle(`${e.server_utility} Invite Stats`)
            .setDescription(
                `${e.tick} **Total Invites:** ${data?.invites || 0}\n` +
                `${e.cross} **Fake:** ${data?.fake || 0}\n` +
                `${e.dot} **Leaves:** ${data?.leaves || 0}`
            )
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
