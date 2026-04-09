const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const UserStat = require('../../models/UserStat');
const UserInvite = require('../../models/UserInvite');

async function buildEmbed(client, guild, type) {
    const e = client.emoji;
    const embed = new MessageEmbed()
        .setColor(client.color)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({ text: `${guild.name} Leaderboard`, iconURL: guild.iconURL({ dynamic: true }) })
        .setTimestamp();

    if (type === 'invites') {
        const data = await UserInvite.find({ guild: guild.id }).sort({ invites: -1 }).limit(10);
        if (!data.length) return embed.setTitle(`${e.server_utility} Invite Leaderboard`).setDescription(`${e.cross} No invite data found.`);

        let board = '';
        let rank = 1;
        for (const entry of data) {
            const user = await client.users.fetch(entry.user).catch(() => null);
            board += `${e.dot} **${rank}.** ${user ? user.tag : 'Unknown'} — **${entry.invites}** invites\n`;
            rank++;
        }
        return embed.setTitle(`${e.server_utility} Invite Leaderboard`).setDescription(board);

    } else if (type === 'voice') {
        const data = await UserStat.find({ guild: guild.id }).sort({ voiceTime: -1 }).limit(10);
        if (!data.length) return embed.setTitle(`${e.server_utility} Voice Leaderboard`).setDescription(`${e.cross} No voice data found.`);

        let board = '';
        let rank = 1;
        for (const entry of data) {
            const user = await client.users.fetch(entry.user).catch(() => null);
            const hours = Math.floor(entry.voiceTime / 60);
            const mins = entry.voiceTime % 60;
            const display = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            board += `${e.dot} **${rank}.** ${user ? user.tag : 'Unknown'} — **${display}**\n`;
            rank++;
        }
        return embed.setTitle(`${e.server_utility} Voice Leaderboard`).setDescription(board);

    } else {
        const data = await UserStat.find({ guild: guild.id }).sort({ messages: -1 }).limit(10);
        if (!data.length) return embed.setTitle(`${e.server_utility} Messages Leaderboard`).setDescription(`${e.cross} No message data found.`);

        let board = '';
        let rank = 1;
        for (const entry of data) {
            const user = await client.users.fetch(entry.user).catch(() => null);
            board += `${e.dot} **${rank}.** ${user ? user.tag : 'Unknown'} — **${entry.messages}** msgs\n`;
            rank++;
        }
        return embed.setTitle(`${e.server_utility} Messages Leaderboard`).setDescription(board);
    }
}

function buildRow(activeType) {
    const types = ['messages', 'voice', 'invites'];
    return new MessageActionRow().addComponents(
        types.map(t =>
            new MessageButton()
                .setCustomId(`lb_${t}`)
                .setLabel(t.charAt(0).toUpperCase() + t.slice(1))
                .setStyle(activeType === t ? 'PRIMARY' : 'SECONDARY')
        )
    );
}

module.exports = {
    name: 'leaderboard',
    aliases: ['lb'],
    description: 'View server leaderboards',
    category: 'serveru',
    premium: false,
    subcommand: [],

    run: async (client, message, args) => {
        let type = (args[0] || 'messages').toLowerCase();
        if (!['messages', 'voice', 'invites'].includes(type)) type = 'messages';

        const embed = await buildEmbed(client, message.guild, type);
        const row = buildRow(type);

        const msg = await message.channel.send({ embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id && ['lb_messages', 'lb_voice', 'lb_invites'].includes(i.customId),
            time: 60000
        });

        collector.on('collect', async i => {
            const newType = i.customId.replace('lb_', '');
            const newEmbed = await buildEmbed(client, message.guild, newType);
            const newRow = buildRow(newType);
            await i.update({ embeds: [newEmbed], components: [newRow] });
        });

        collector.on('end', () => {
            const disabledRow = new MessageActionRow().addComponents(
                ['messages', 'voice', 'invites'].map(t =>
                    new MessageButton()
                        .setCustomId(`lb_${t}_done`)
                        .setLabel(t.charAt(0).toUpperCase() + t.slice(1))
                        .setStyle('SECONDARY')
                        .setDisabled(true)
                )
            );
            msg.edit({ components: [disabledRow] }).catch(() => null);
        });
    }
};
