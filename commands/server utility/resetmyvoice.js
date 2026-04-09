const { MessageEmbed } = require('discord.js');
const UserStat = require('../../models/UserStat');

module.exports = {
    name: 'resetmyvoice',
    description: 'Reset your own voice time',
    category: 'serveru',
    premium: false,
    subcommand: [],

    run: async (client, message) => {
        const e = client.emoji;
        await UserStat.findOneAndUpdate(
            { guild: message.guild.id, user: message.author.id },
            { voiceTime: 0, dailyVoiceTime: 0 },
            { upsert: true }
        );

        message.channel.send({
            embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.tick} Your voice time has been reset.`)]
        });
    }
};
