const UserStat = require('../models/UserStat');

const cooldowns = new Map();

module.exports = async (client) => {

    client.on('messageCreate', async (message) => {
        if (!message.guild || message.author.bot) return;

        const key = `${message.guild.id}-${message.author.id}`;
        const now = Date.now();

        if (cooldowns.has(key) && now - cooldowns.get(key) < 3000) return;
        cooldowns.set(key, now);

        try {
            const today = new Date().toDateString();

            let data = await UserStat.findOne({ guild: message.guild.id, user: message.author.id });

            if (!data) {
                await UserStat.create({
                    guild: message.guild.id,
                    user: message.author.id,
                    messages: 1,
                    dailyMessages: 1,
                    lastMessageDate: new Date()
                });
                return;
            }

            const lastDate = data.lastMessageDate ? new Date(data.lastMessageDate).toDateString() : null;
            const isNewDay = lastDate !== today;

            if (isNewDay) {
                data.dailyMessages = 1;
            } else {
                data.dailyMessages += 1;
            }

            data.messages += 1;
            data.lastMessageDate = new Date();
            await data.save();

        } catch (err) {
            console.error('Error tracking message stat:', err);
        }
    });

};
