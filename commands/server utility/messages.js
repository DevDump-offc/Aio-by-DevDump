const { MessageEmbed } = require('discord.js');
const UserStat = require('../../models/UserStat');

module.exports = {
    name: 'messages',
    aliases: ['msg'],
    description: 'Check messages sent by a member',
    category: 'serveru',
    premium: false,
    subcommand: [],

    run: async (client, message, args) => {
        const e = client.emoji;
        const member = message.mentions.members.first() || message.member;
        const data = await UserStat.findOne({ guild: message.guild.id, user: member.id });

        if (!data || data.messages === 0) {
            return message.channel.send({
                embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.cross} ${member} hasn't sent any tracked messages yet.`)]
            });
        }

        const embed = new MessageEmbed()
            .setColor(client.color)
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setTitle(`${e.server_utility} Message Stats`)
            .addFields(
                { name: `${e.tick} Total Messages`, value: `**${data.messages}**`, inline: true },
                { name: `${e.dot} Today's Messages`, value: `**${data.dailyMessages}**`, inline: true }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
