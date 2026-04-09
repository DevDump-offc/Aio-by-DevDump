const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');
const UserStat = require('../../models/UserStat');

module.exports = {
    name: 'resetmessages',
    description: 'Reset all message counts in the server',
    category: 'serveru',
    premium: false,
    subcommand: [],

    run: async (client, message) => {
        const e = client.emoji;
        const isSpecialMember = config.boss.includes(message.author.id);
        if (!isSpecialMember && !message.member.permissions.has('ADMINISTRATOR')) {
            return message.channel.send({
                embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.cross} You don't have permission.`)]
            });
        }

        await UserStat.updateMany({ guild: message.guild.id }, { messages: 0, dailyMessages: 0 });

        message.channel.send({
            embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.tick} All message counts have been reset.`)]
        });
    }
};
