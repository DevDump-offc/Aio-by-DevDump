const { Message, Client, MessageEmbed } = require('discord.js')

module.exports = {
    name: 'boostcount',
    aliases: ['bc'],
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        
        const boostCount = message.guild.premiumSubscriptionCount || 0;

        
        const embed = new MessageEmbed()
            .setColor(client.color)
            .setTitle(`${message.guild.name}`)
            .setDescription(`** BoostCount**\n** ${boostCount} Boosts**`);

        
        message.channel.send({ embeds: [embed] });
    }
}
