const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
name: 'sinvite',
aliases: ['sinv'],
category: 'owner',
premium: false,

run: async (client, message, args) => {

    if (!config.boss.includes(message.author.id)) return;

    const guildId = args[0];
    if (!guildId) {
        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} Please provide a server ID.`)
            ]
        });
    }

    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} I am not in that server.`)
            ]
        });
    }

    let invite = "No Invite";

    try {

        const channel =
            guild.systemChannel ||
            guild.channels.cache.find(c =>
                c.type === "GUILD_TEXT" &&
                c.permissionsFor(guild.me)?.has("CREATE_INSTANT_INVITE")
            );

        if (!channel) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} I cannot create invite in that server.`)
                ]
            });
        }

        const createdInvite = await channel.createInvite({
            maxAge: 0,
            maxUses: 0
        });

        invite = `https://discord.gg/${createdInvite.code}`;

    } catch (err) {
        invite = "No Permission";
    }

    message.channel.send({
        embeds: [
            new MessageEmbed()
                .setColor(client.color)
                .setTitle(guild.name)
                .setDescription(`Invite: ${invite}\nID: ${guild.id}`)
        ]
    });

}

};