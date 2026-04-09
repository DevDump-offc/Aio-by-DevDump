const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');
const UserInvite = require('../../models/UserInvite');

module.exports = {
    name: 'resetinvite',
    description: 'Reset all invites in the server',
    category: 'serveru',
    premium: false,
    subcommand: [],

    run: async (client, message, args) => {
        const e = client.emoji;
        const isSpecialMember = config.boss.includes(message.author.id);
        if (!isSpecialMember && !message.member.permissions.has('ADMINISTRATOR')) return;

        await UserInvite.updateMany({ guild: message.guild.id }, { invites: 0, fake: 0, leaves: 0 });

        message.channel.send({
            embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.tick} All invite counts have been reset.`)]
        });
    }
};
