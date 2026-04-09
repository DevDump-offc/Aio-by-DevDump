const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = async (client) => {
    // Helper to get log channel
    const getLogChannel = async (guildId, type) => {
        const data = await client.db.get(`logs_${guildId}`);
        if (!data || !data[type]) return null;
        return client.channels.cache.get(data[type]) || await client.channels.fetch(data[type]).catch(() => null);
    };

    // Message Delete
    client.on('messageDelete', async (message) => {
        if (!message.guild || message.author?.bot) return;
        const channel = await getLogChannel(message.guild.id, 'message');
        if (!channel) return;

        const embed = new MessageEmbed()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTitle('Message Deleted')
            .setColor(client.color)
            .setDescription(`**Content:** ${message.content || 'None'}\n**Channel:** ${message.channel}\n**Author:** ${message.author} (${message.author.id})`)
            .setTimestamp();
        
        channel.send({ embeds: [embed] }).catch(() => {});
    });

    // Message Update
    client.on('messageUpdate', async (oldMessage, newMessage) => {
        if (!oldMessage.guild || oldMessage.author?.bot || oldMessage.content === newMessage.content) return;
        const channel = await getLogChannel(oldMessage.guild.id, 'message');
        if (!channel) return;

        const embed = new MessageEmbed()
            .setAuthor({ name: oldMessage.author.tag, iconURL: oldMessage.author.displayAvatarURL({ dynamic: true }) })
            .setTitle('Message Updated')
            .setColor(client.color)
            .setDescription(`**Old Content:** ${oldMessage.content}\n**New Content:** ${newMessage.content}\n**Channel:** ${oldMessage.channel}\n**Author:** ${oldMessage.author}`)
            .setTimestamp();
        
        channel.send({ embeds: [embed] }).catch(() => {});
    });

    // Member Join
    client.on('guildMemberAdd', async (member) => {
        const channel = await getLogChannel(member.guild.id, 'memberlog');
        if (!channel) return;

        const embed = new MessageEmbed()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setTitle('Member Joined')
            .setColor(client.color)
            .setDescription(`${member.user} joined the server.\nID: ${member.id}\nCreated: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`)
            .setTimestamp();
        
        channel.send({ embeds: [embed] }).catch(() => {});
    });

    // Member Leave
    client.on('guildMemberRemove', async (member) => {
        const channel = await getLogChannel(member.guild.id, 'memberlog');
        if (!channel) return;

        const embed = new MessageEmbed()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setTitle('Member Left')
            .setColor(client.color)
            .setDescription(`${member.user} left the server.\nID: ${member.id}`)
            .setTimestamp();
        
        channel.send({ embeds: [embed] }).catch(() => {});
    });

    // Role Create
    client.on('roleCreate', async (role) => {
        const channel = await getLogChannel(role.guild.id, 'rolelog');
        if (!channel) return;

        const embed = new MessageEmbed()
            .setTitle('Role Created')
            .setColor(client.color)
            .setDescription(`Name: ${role.name}\nID: ${role.id}`)
            .setTimestamp();
        
        channel.send({ embeds: [embed] }).catch(() => {});
    });

    // Role Delete
    client.on('roleDelete', async (role) => {
        const channel = await getLogChannel(role.guild.id, 'rolelog');
        if (!channel) return;

        const embed = new MessageEmbed()
            .setTitle('Role Deleted')
            .setColor(client.color)
            .setDescription(`Name: ${role.name}\nID: ${role.id}`)
            .setTimestamp();
        
        channel.send({ embeds: [embed] }).catch(() => {});
    });

    // Channel Create
    client.on('channelCreate', async (chan) => {
        if (!chan.guild) return;
        const channel = await getLogChannel(chan.guild.id, 'channel');
        if (!channel) return;

        const embed = new MessageEmbed()
            .setTitle('Channel Created')
            .setColor(client.color)
            .setDescription(`Name: ${chan.name}\nType: ${chan.type}\nID: ${chan.id}`)
            .setTimestamp();
        
        channel.send({ embeds: [embed] }).catch(() => {});
    });

    // Channel Delete
    client.on('channelDelete', async (chan) => {
        if (!chan.guild) return;
        const channel = await getLogChannel(chan.guild.id, 'channel');
        if (!channel) return;

        const embed = new MessageEmbed()
            .setTitle('Channel Deleted')
            .setColor(client.color)
            .setDescription(`Name: ${chan.name}\nID: ${chan.id}`)
            .setTimestamp();
        
        channel.send({ embeds: [embed] }).catch(() => {});
    });

    // Voice State Update
    client.on('voiceStateUpdate', async (oldState, newState) => {
        const channel = await getLogChannel(newState.guild.id, 'voice');
        if (!channel) return;

        const embed = new MessageEmbed()
            .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.displayAvatarURL({ dynamic: true }) })
            .setColor(client.color)
            .setTimestamp();

        if (!oldState.channelId && newState.channelId) {
            embed.setTitle('Voice Join').setDescription(`${newState.member.user} joined ${newState.channel}`);
        } else if (oldState.channelId && !newState.channelId) {
            embed.setTitle('Voice Leave').setDescription(`${oldState.member.user} left ${oldState.channel}`);
        } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            embed.setTitle('Voice Move').setDescription(`${newState.member.user} moved from ${oldState.channel} to ${newState.channel}`);
        } else return;

        channel.send({ embeds: [embed] }).catch(() => {});
    });

    // Guild Create/Delete Logs (Owner Only)
    const joinChannelId = '1431349648420765977';
    const leaveChannelId = '1431349678901039114';

    client.on('guildCreate', async (guild) => {
        const channel = await client.channels.fetch(joinChannelId).catch(() => null);
        if (!channel) return;
        const owner = await guild.fetchOwner();
        const embed = new MessageEmbed()
            .setTitle(`Joined ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(client.color)
            .setDescription(`ID: ${guild.id}\nOwner: ${owner.user.tag} (${owner.id})\nMembers: ${guild.memberCount}`)
            .setTimestamp();
        channel.send({ embeds: [embed] }).catch(() => {});
    });

    client.on('guildDelete', async (guild) => {
        const channel = await client.channels.fetch(leaveChannelId).catch(() => null);
        if (!channel) return;
        const embed = new MessageEmbed()
            .setTitle(`Left ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(client.color)
            .setDescription(`ID: ${guild.id}\nMembers: ${guild.memberCount}`)
            .setTimestamp();
        channel.send({ embeds: [embed] }).catch(() => {});
    });
};
