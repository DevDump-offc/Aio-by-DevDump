const { MessageEmbed } = require('discord.js');
const UserInvite = require('../../models/UserInvite');

module.exports = {
    name: 'invites',
    description: 'Check invite count',
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
            .addFields(
                { name: `${e.tick} Total`, value: `**${data?.invites || 0}**`, inline: true },
                { name: `${e.cross} Fake`, value: `**${data?.fake || 0}**`, inline: true },
                { name: `${e.dot} Leaves`, value: `**${data?.leaves || 0}**`, inline: true }
            )
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
