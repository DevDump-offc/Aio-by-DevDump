const { Message, Client, MessageEmbed } = require('discord.js')
const banner = require('./banner')

module.exports = {
    name: 'membercount',
    aliases: ['mc'],
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        const embed = new MessageEmbed()
            .setColor(client.color)
            .setTitle(`${message.guild.name}`)
            .setDescription(`** MemberCount**\n** ${message.guild.memberCount} Members**`)
            .setTimestamp()

        message.channel.send({ embeds: [embed] })
    }
}