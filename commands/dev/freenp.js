const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

// ===== Cooldown Map =====
const cooldown = new Map();
const COOLDOWN_TIME = 30 * 1000; // 30 seconds

module.exports = {
    name: 'freenp',
    aliases: ['free_np', 'npfree'],
    category: 'dev',
    premium: false,

    run: async (client, message, args) => {

        const embed = new MessageEmbed()
            .setColor(client.color)
            .setAuthor({
                name: 'Access Free No Prefix',
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(
                `Click the button below to claim **1 month** of free No-Prefix access.

**Note:** You can receive No Prefix once for free..`
            );

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('claim_free_np')
                .setLabel('Claim No Prefix')
                .setStyle('SECONDARY')
        );

        return message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
};


// ================= BUTTON HANDLER =================

module.exports.handleButton = async (interaction, client) => {

    if (interaction.customId !== 'claim_free_np') return;

    const userId = interaction.user.id;
    const now = Date.now();

    // ===== COOLDOWN CHECK =====
    if (cooldown.has(userId)) {
        const expiration = cooldown.get(userId);

        if (now < expiration) {
            const timeLeft = ((expiration - now) / 1000).toFixed(1);

            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.color)
                        .setDescription(`Please wait **${timeLeft}s** before using this again.`)
                ],
                ephemeral: true
            });
        }
    }

    cooldown.set(userId, now + COOLDOWN_TIME);

    // Auto delete cooldown after time
    setTimeout(() => {
        cooldown.delete(userId);
    }, COOLDOWN_TIME);


    const embed = new MessageEmbed().setColor(client.color);

    let npList = await client.db.get(`noprefix_${client.user.id}`) || [];

    const alreadyUsed = await client.db.get(`np_free_used_${userId}`);

    // ===== Cleanup expired entries =====
    npList = npList.filter(entry => {
        if (entry.expiration === 'Unlimited') return true;
        if (!entry.expiration) return true;
        if (now > entry.expiration) return false;
        return true;
    });

    await client.db.set(`noprefix_${client.user.id}`, npList);

    // ===== Check if already has NP =====
    const existing = npList.find(entry => entry.userId === userId);

    if (existing) {

        if (existing.expiration === 'Unlimited') {
            return interaction.reply({
                embeds: [
                    embed.setDescription(`You already have **Unlimited No Prefix**.`)
                ],
                ephemeral: true
            });
        }

        return interaction.reply({
            embeds: [
                embed.setDescription(
                    `You already have **No Prefix**.\nExpires: <t:${Math.floor(existing.expiration / 1000)}:R>`
                )
            ],
            ephemeral: true
        });
    }

    // ===== One-time free check =====
    if (alreadyUsed) {
        return interaction.reply({
            embeds: [
                embed.setDescription(
                    `You have already claimed your **Free No Prefix** once.\nYou cannot claim it again.`
                )
            ],
            ephemeral: true
        });
    }

    // ===== Grant 30 Days NP =====
    const duration = 30 * 24 * 60 * 60 * 1000;
const expiration = now + duration;

    npList.push({
        userId: userId,
        expiration: expiration
    });

    await client.db.set(`noprefix_${client.user.id}`, npList);
    await client.db.set(`np_free_used_${userId}`, true);

    // Refresh runtime cache
    client.util.noprefix();

    return interaction.reply({
        embeds: [
            embed.setDescription(
                `Successfully claimed **Free No Prefix** for **1-month**!\nExpires: <t:${Math.floor(expiration / 1000)}:R>`
            )
        ],
        ephemeral: true
    });
};