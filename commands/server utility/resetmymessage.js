const { MessageEmbed } = require('discord.js');
const UserStat = require('../../models/UserStat');

module.exports = {
    name: 'resetmymessage',
    aliases: ['resetmymessages'],
    description: 'Reset your own message count',
    category: 'serveru',
    premium: false,
    subcommand: [],

    run: async (client, message) => {
        const e = client.emoji;
        await UserStat.findOneAndUpdate(
            { guild: message.guild.id, user: message.author.id },
            { messages: 0, dailyMessages: 0 },
            { upsert: true }
        );

        message.channel.send({
            embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.tick} Your message count has been reset.`)]
        });
    }
};
