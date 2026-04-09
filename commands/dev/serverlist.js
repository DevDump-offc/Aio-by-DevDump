const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
name: 'serverslist',
category: 'owner',
aliases: ['slist'],
description: '',

run: async (client, message, args) => {

    if (!config.boss.includes(message.author.id)) return;

    let servers = client.guilds.cache
        .sort((a, b) => b.memberCount - a.memberCount)
        .map(g => g);

    let serverslist = [];

    for (let i = 0; i < servers.length; i++) {

        const guild = servers[i];
        const name = guild.name;
        const id = guild.id;

        let invite = "No Invite";

        try {

            const channel = guild.channels.cache.find(c =>
                c.type === "GUILD_TEXT" &&
                c.permissionsFor(guild.me)?.has("CREATE_INSTANT_INVITE")
            );

            if (channel) {

                const createdInvite = await channel.createInvite({
                    maxAge: 0,
                    maxUses: 0,
                    unique: true
                });

                invite = `(<https://discord.gg/${createdInvite.code}>)`;
            }

        } catch {
            invite = "No Permission";
        }

        serverslist.push(`${i + 1}) [${name}]${invite} - (\`\`\`${id}\`\`\`)`);
    }

    const itemsPerPage = 10;
    const pages = Math.ceil(serverslist.length / itemsPerPage);
    let currentPage = 0;

    const generatePage = () => {
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        return serverslist.slice(start, end).join('\n');
    };

    const embed = new MessageEmbed()
        .setTitle(`Server List Of ${client.user.username}`)
        .setColor(client.color)
        .setDescription(generatePage());

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('prevButton')
                .setLabel('Previous')
                .setStyle('SECONDARY'),

            new MessageButton()
                .setCustomId('nextButton')
                .setLabel('Next')
                .setStyle('SECONDARY')
        );

    const sentMessage = await message.channel.send({
        embeds: [embed],
        components: [row]
    });

    const filter = interaction => interaction.user.id === message.author.id;

    const collector = sentMessage.createMessageComponentCollector({
        filter,
        time: 60000
    });

    collector.on('collect', async interaction => {

        if (interaction.customId === 'prevButton') {
            if (currentPage > 0) currentPage--;
        }

        if (interaction.customId === 'nextButton') {
            if (currentPage < pages - 1) currentPage++;
        }

        embed.setDescription(generatePage());

        await interaction.update({
            embeds: [embed],
            components: [row]
        });

    });

    collector.on('end', () => {
        if (!sentMessage.deleted && sentMessage.editable) {
            sentMessage.edit({ components: [] }).catch(() => {});
        }
    });

}

};