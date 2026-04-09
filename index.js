const path = require('path');

const Fynox = require('./structures/Fynox.js');
const client = new Fynox();
client.setMaxListeners(20);

const Giveaway = require('./models/giveaway');
const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');

const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot is running'));

const activeTimeouts = {};

async function loadActiveGiveaways(client, activeTimeouts) {
    try {
        const giveaways = await Giveaway.find({ endsAt: { $gt: new Date() } });
        giveaways.forEach(giveaway => {
            const remainingTime = new Date(giveaway.endsAt) - new Date();
            if (remainingTime > 0) {
                const timeout = setTimeout(async () => {
                    await endGiveaway(client, giveaway, activeTimeouts);
                }, remainingTime);
                activeTimeouts[giveaway.messageId] = timeout;
            } else {
                endGiveaway(client, giveaway, activeTimeouts);
            }
        });
    } catch (e) {
        console.error('Error loading giveaways:', e);
    }
}

async function endGiveaway(client, giveaway, activeTimeouts) {
    const channel = await client.channels.cache.get(giveaway.channelId);
    if (!channel) return;

    try {
        if (giveaway.isEnded) return;

        const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
        if (!message) return;

        const reactions = message.reactions.cache.find(
            r => r.emoji.id === giveaway.emoji || r.emoji.name === giveaway.emoji
        );
        if (!reactions) return;

        const users = await reactions.users.fetch();
        const filtered = users.filter(user => !user.bot);

        let winners = [];
        if (filtered.size > 0) {
            for (let i = 0; i < giveaway.numWinners; i++) {
                if (filtered.size === 0) break;
                const winner = filtered.random();
                winners.push(winner);
                filtered.delete(winner.id);
            }

            const congratulationsMessage =
                `Congrats, ${winners.map(user => user.toString()).join(', ')} You won **${giveaway.prize}**, hosted by <@${giveaway.hostId}>`;

            const giveawayLinkButton = new MessageButton()
                .setLabel('View Giveaway')
                .setStyle('LINK')
                .setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`);

            const actionRow = new MessageActionRow().addComponents(giveawayLinkButton);

            await channel.send({
                content: congratulationsMessage,
                components: [actionRow]
            }).catch(() => {});
        }

        const endEmbed = new MessageEmbed(message.embeds[0] || {})
            .setTitle(`**${giveaway.prize}**`)
            .setDescription(
`Ended: <t:${Math.floor(Date.now() / 1000)}:R>
Hosted by: <@${giveaway.hostId}>

**Winners:**
${winners.length > 0 ? winners.map(user => user.toString()).join(', ') : 'No winners'}`
            )
            .setFooter('Ended');

        await message.edit({
            content: '**Giveaway Ended**',
            embeds: [endEmbed]
        }).catch(() => {});

        if (activeTimeouts[giveaway.messageId]) {
            clearTimeout(activeTimeouts[giveaway.messageId]);
            delete activeTimeouts[giveaway.messageId];
        }
    } catch (error) {
        console.error('Error ending giveaway:', error);
    }
}

async function updateExpiredEntries() {
    try {
        let entries = (await client.db.get(`noprefix_${client.user.id}`)) || [];
        const now = Date.now();
        entries = entries.filter(entry =>
            entry.expiration === 'Unlimited' || entry.expiration > now
        );
        await client.db.set(`noprefix_${client.user.id}`, entries);
    } catch (e) {}
}

function gracefulShutdown(signal) {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    for (const id of Object.keys(activeTimeouts)) {
        clearTimeout(activeTimeouts[id]);
    }
    client.destroy();
    process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

(async () => {
    try {
        const PORT = process.env.PORT || 3000;

        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`HTTP server running on port ${PORT}`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.warn(`Port ${PORT} in use — HTTP server skipped.`);
            } else {
                console.error('HTTP server error:', err.message);
            }
        });

        console.log('Initializing Databases...');
        await client.initializeMongoose();
        await client.initializedata();

        console.log('Loading Events and Commands...');
        await client.loadEvents();
        await client.loadlogs();
        await client.loadMain();

        const token = client.config.TOKEN;
        if (!token) {
            console.error('ERROR: No TOKEN found in config.json. Bot cannot start.');
            process.exit(1);
        }

        console.log('Logging in to Discord...');
        await client.login(token);

        console.log('Starting background tasks...');
        await loadActiveGiveaways(client, activeTimeouts);
        await updateExpiredEntries();

        console.log('Bot is online!');

    } catch (error) {
        console.error('Fatal startup error:', error);
        process.exit(1);
    }
})();

module.exports.endGiveaway = endGiveaway;
module.exports.activeTimeouts = activeTimeouts;
