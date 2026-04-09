const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');
const UserStat = require('../../models/UserStat');

module.exports = {
    name: 'resetvoice',
    description: 'Reset all voice stats in the server',
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

        await UserStat.updateMany({ guild: message.guild.id }, { voiceTime: 0, dailyVoiceTime: 0 });

        message.channel.send({
            embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.tick} All voice stats have been reset.`)]
        });
    }
};
