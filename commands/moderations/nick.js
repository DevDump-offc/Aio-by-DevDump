const { MessageEmbed } = require('discord.js');
const Admin = require('../../models/admin');
const config = require('../../config.json');

module.exports = {
name: 'nick',
aliases: [],
category: 'mod',
premium: false,

run: async (client, message, args) => {

    const prefix = client.prefix || "&";

    // support prefix and no prefix
    if (!args.length) {
        const content = message.content.startsWith(prefix)
            ? message.content.slice(prefix.length)
            : message.content;

        args = content.trim().split(/ +/).slice(1);
    }

    const guildId = message.guild.id;
    const authorId = message.author.id;

    const isModerator = await client.db.get(`moderators_${guildId}`);
    const isMod = isModerator?.moderators?.includes(authorId);

    const adminId = message.member.id;
    const admin = await Admin.findOne({ guildId, adminId });

    const isSpecialMember = config.boss.includes(message.author.id);

    if (!isSpecialMember && !admin && !isMod) {
        if (!message.member.permissions.has('MANAGE_NICKNAMES')) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.color)
                        .setDescription('You must have `Manage Nicknames` permission to use this command.')
                ]
            });
        }
    }

    if (!message.guild.me.permissions.has('MANAGE_NICKNAMES')) {
        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription('I must have `Manage Nicknames` permission to use this command.')
            ]
        });
    }

    let member = await getUserFromMention(message, args[0]);

    if (!member) {
        try {
            member = await message.guild.members.fetch(args[0]);
        } catch {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} Please provide a valid member.`)
                ]
            });
        }
    }

    const name = args.slice(1).join(" ");

    if (!isSpecialMember && !admin && !isMod &&
        message.member.roles.highest.position <= member.roles.highest.position) {

        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} You cannot change the nickname of a member with an equal or higher role.`)
            ]
        });
    }

    if (message.guild.me.roles.highest.position <= member.roles.highest.position) {
        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} My role must be higher than the member's role.`)
            ]
        });
    }

    try {

        if (!name) {

            await member.setNickname(null);

            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.tick} ${member}'s nickname has been removed.`)
                ]
            });

        } else {

            await member.setNickname(name);

            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.tick} ${member}'s nickname changed to **${name}**.`)
                ]
            });

        }

    } catch {

        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} I don't have permission or my role is lower.`)
            ]
        });

    }

}

};

async function getUserFromMention(message, mention) {

if (!mention) return null;

const matches = mention.match(/^<@!?(\d+)>$/);
if (!matches) return null;

const id = matches[1];

try {
    return await message.guild.members.fetch(id);
} catch {
    return null;
}

}