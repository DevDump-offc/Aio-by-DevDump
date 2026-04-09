const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1485163091883720734/BJZMBjj_lxXqFZrOscqhJDji-DUCucNsjmwxrakAzEdIVJMDJWKt3JNEm9aGugEwpoNS';

module.exports = {
    name: 'noprefix',
    aliases: ['np'],
    subcommand: ['add', 'remove', 'list'],
    category: 'owner',
    run: async (client, message, args) => {
        if (!client.config.np.includes(message.author.id)) return;

        const embed = new MessageEmbed().setColor(client.color);
        let prefix = message.guild.prefix;

        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `Please provide the required arguments.\n${prefix}noprefix \`<add/remove/list>\` \`<user id>\` \`<time>\``
                        )
                ]
            });
        }

        if (args[0].toLowerCase() === 'list') {
            let listing = await client.db.get(`noprefix_${client.user.id}`) || [];
            let info = [];

            if (listing.length < 1) info.push(`No Users ;-;`);
            else {

                for (let i = 0; i < listing.length; i++) {

                    let userEntry = listing[i];

                    if (typeof userEntry === 'string') {
                        userEntry = { userId: userEntry, expiration: 'Unlimited' };
                    }

                    const user = await client.users.fetch(userEntry.userId).catch(() => null);

                    let expiration;

                    if (userEntry.expiration === 'Unlimited' || userEntry.expiration === undefined) {
                        expiration = 'Unlimited';
                    } else {

                        const now = Date.now();
                        const timeLeft = userEntry.expiration - now;

                        if (timeLeft <= 0) {
                            expiration = `Expired <t:${Math.floor(userEntry.expiration / 1000)}:R>`;
                        } else {
                            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                            expiration = `${days}d ${hours}h left - <t:${Math.floor(userEntry.expiration / 1000)}:D>`;
                        }
                    }

                    if (user) {
                        info.push(`${i + 1}) ${user.tag} (${user.id}) Expires: ${expiration}`);
                    } else {
                        info.push(`${i + 1}) Unknown User (${userEntry.userId}) Expires: ${expiration}`);
                    }
                }
            }

            return await enhancedPagination(message, info, '**No Prefix Users List:-**', client.color);
        }

        let userId = args[1]?.replace(/[<@!>]/g, '');

        let user;

        try {
            user = await client.users.fetch(userId);
        } catch {
            return message.channel.send({
                embeds: [
                    embed
                        .setDescription(`Invalid User ID.`)
                ]
            });
        }

        let added = await client.db.get(`noprefix_${client.user.id}`) || [];

        if (args[0] === 'add') {

            if (added.some(entry => entry.userId === user.id)) {

                return message.channel.send({
                    embeds: [
                        embed
                            .setDescription(`${client.emoji.cross} User already has No Prefix.`)
                    ]
                });
            }

            added.push({ userId: user.id, expiration: 'Unlimited' });

            await client.db.set(`noprefix_${client.user.id}`, added);

            client.util.noprefix();

            return message.channel.send({
                embeds: [
                    embed
                        .setDescription(`${client.emoji.tick} ${user.tag} added to No Prefix.`)
                ]
            });
        }

        if (args[0] === 'remove') {

            if (!added.some(entry => entry.userId === user.id)) {

                return message.channel.send({
                    embeds: [
                        embed
                            .setDescription(`${client.emoji.cross} User not in No Prefix list.`)
                    ]
                });
            }

            added = added.filter(entry => entry.userId !== user.id);

            await client.db.set(`noprefix_${client.user.id}`, added);

            client.util.noprefix();

            return message.channel.send({
                embeds: [
                    embed
                        .setDescription(`${client.emoji.tick} ${user.tag} removed from No Prefix.`)
                ]
            });
        }

    }
};

const enhancedPagination = async (message, data, title, color) => {

    const itemsPerPage = 10;

    const pages = Math.ceil(data.length / itemsPerPage);

    let currentPage = 0;

    const generatePage = () => {

        const pageStart = currentPage * itemsPerPage;

        const pageEnd = pageStart + itemsPerPage;

        return data.slice(pageStart, pageEnd).join('\n');

    };

    const createEmbed = () => {

        return new MessageEmbed()

            .setTitle(title)

            .setColor(color)

            .setDescription(generatePage())

            .setFooter({ text: `Page ${currentPage + 1} of ${pages}` });

    };

    const createButtons = () => {

        return new MessageActionRow()

            .addComponents(

                new MessageButton()

                    .setCustomId('prev')

                    .setLabel('Prev')

                    .setStyle('SECONDARY')

                    .setDisabled(currentPage === 0),

                new MessageButton()

                    .setCustomId('next')

                    .setLabel('Next')

                    .setStyle('SECONDARY')

                    .setDisabled(currentPage === pages - 1)

            );

    };

    const msg = await message.channel.send({

        embeds: [createEmbed()],

        components: [createButtons()]

    });

    const collector = msg.createMessageComponentCollector({

        filter: i => i.user.id === message.author.id,

        time: 60000

    });

    collector.on('collect', async interaction => {

        if (interaction.customId === 'prev') currentPage--;

        if (interaction.customId === 'next') currentPage++;

        await interaction.update({

            embeds: [createEmbed()],

            components: [createButtons()]

        });

    });

};