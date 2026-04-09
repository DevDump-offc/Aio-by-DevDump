const { MessageEmbed } = require('discord.js');
const UserInvite = require('../../models/UserInvite');

module.exports = {
    name: 'invited',
    description: 'See how many members you have invited',
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
            .setDescription(`${e.server_utility} ${member} has invited **${data?.invites || 0}** members to this server.`)
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
