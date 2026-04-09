const { MessageEmbed } = require('discord.js');
const UserInvite = require('../../models/UserInvite');

module.exports = {
    name: 'resetmyinvites',
    description: 'Reset your own invite count',
    category: 'serveru',
    premium: false,
    subcommand: [],

    run: async (client, message) => {
        const e = client.emoji;
        await UserInvite.findOneAndUpdate(
            { guild: message.guild.id, user: message.author.id },
            { invites: 0, fake: 0, leaves: 0 },
            { upsert: true }
        );

        message.channel.send({
            embeds: [new MessageEmbed().setColor(client.color).setDescription(`${e.tick} Your invite count has been reset.`)]
        });
    }
};
