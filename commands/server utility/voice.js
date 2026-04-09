const { MessageEmbed } = require('discord.js');
const UserStat = require('../../models/UserStat');

module.exports = {
    name: 'voice',
    description: 'Check voice time of a member',
    category: 'serveru',
    premium: false,
    subcommand: [],

    run: async (client, message, args) => {
        const e = client.emoji;
        const member = message.mentions.members.first() || message.member;
        const data = await UserStat.findOne({ guild: message.guild.id, user: member.id });

        const minutes = data?.voiceTime || 0;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const display = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        const embed = new MessageEmbed()
            .setColor(client.color)
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setTitle(`${e.server_utility} Voice Stats`)
            .addFields(
                { name: `${e.tick} Total Voice Time`, value: `**${display}**`, inline: true },
                { name: `${e.dot} Today's Voice Time`, value: `**${data?.dailyVoiceTime || 0}m**`, inline: true }
            )
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
