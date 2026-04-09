const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
    name: "userinfo",
    aliases: ['ui', 'whois'],
    category: 'info',
    description: "Get information about a user",
    run: async (client, message, args) => {
        const permissions = {
            "ADMINISTRATOR": "Administrator",
            "MANAGE_GUILD": "Manage Server",
            "MANAGE_ROLES": "Manage Roles",
            "MANAGE_CHANNELS": "Manage Channels",
            "KICK_MEMBERS": "Kick Members",
            "BAN_MEMBERS": "Ban Members",
            "MANAGE_NICKNAMES": "Manage Nicknames",
            "MANAGE_EMOJIS": "Manage Emojis",
            "MANAGE_WEBHOOKS": "Manage Webhooks",
            "MANAGE_MESSAGES": "Manage Messages",
            "MENTION_EVERYONE": "Mention Everyone"
        };

        let user = message.mentions.users.first() || message.author;

        if (args[0] && !message.mentions.users.first()) {
            try {
                user = await client.users.fetch(args[0]);
            } catch (error) {
                return message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Please provide a valid user ID or mention a member.`
                            )
                    ]
                });
            }
        }

        const usericon = user.displayAvatarURL({ dynamic: true });

        let member = null;
        try {
            member = await message.guild.members.fetch(user.id);
        } catch (error) {
        }

        const flags = {
            "DISCORD_EMPLOYEE": "",
            "DISCORD_PARTNER": "",
            "BUGHUNTER_LEVEL_1": "",
            "BUGHUNTER_LEVEL_2": "",
            "HYPESQUAD_EVENTS": "",
            "HOUSE_BRILLIANCE": "",
            "HOUSE_BRAVERY": "",
            "HOUSE_BALANCE": "",
            "EARLY_SUPPORTER": "",
            "TEAM_USER": "",
            "VERIFIED_BOT": "",
            "EARLY_VERIFIED_DEVELOPER": ""
        };

        const userFlags = user.flags ? user.flags.toArray() : [];

        const userlol = new MessageEmbed()
            .setAuthor(`${user.username}'s Information`, usericon)
            .setThumbnail(usericon)
            .addField(`General Information`,
                `Name: \`${user.tag}\`\n` +
                `ID: \`${user.id}\`\n` +
                `Created On: ${moment(user.createdTimestamp).format('llll')}\n\n`
            )
            .addField(`Overview`,
                `Badges: ${userFlags.length ? userFlags.map(flag => flags[flag]).filter(Boolean).join(' ') : 'None'}\n` +
                `Type: ${user.bot ? 'Bot' : 'Human'}\n\n`
            );

        if (member) {
            const nick = member.nickname || "None";
            const topRole = member.roles.highest;
            const mentionPermissions = member.permissions.toArray();
            const finalPermissions = mentionPermissions.map(permission => permissions[permission]).filter(Boolean);

            userlol.addField(`Server Related Information`,
                `Nickname: \`${nick}\`\n` +
                `Joined Server: ${moment(member.joinedTimestamp).format('llll')}\n` +
                `Top Role: ${topRole}\n` +
                `Roles [${member.roles.cache.size - 1}]: ${member.roles.cache.size > 1 ? member.roles.cache.filter(r => r.id !== message.guild.id).map(role => role).join(', ') : 'None'}\n` +
                `Key Permissions: ${finalPermissions.length ? finalPermissions.map(permission => `\`${permission}\``).join(', ') : 'None'}\n\n`
            );
        }

        userlol.setColor(client.color)
            .setFooter(`Requested By: ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        message.channel.send({ embeds: [userlol] });
    }
};