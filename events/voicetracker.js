const UserStat = require('../models/UserStat');

const voiceSessions = new Map();

module.exports = async (client) => {

    client.on('ready', () => {
        client.guilds.cache.forEach(guild => {
            guild.voiceStates.cache.forEach(vs => {
                if (vs.channelId && vs.member && !vs.member.user.bot) {
                    const key = `${guild.id}-${vs.id}`;
                    voiceSessions.set(key, Date.now());
                }
            });
        });
    });

    client.on('voiceStateUpdate', async (oldState, newState) => {
        const userId = newState.member?.id || oldState.member?.id;
        if (!userId) return;

        const member = newState.member || oldState.member;
        if (member?.user?.bot) return;

        const guildId = newState.guild?.id || oldState.guild?.id;
        if (!guildId) return;

        const key = `${guildId}-${userId}`;
        const now = Date.now();

        const joinedVoice = !oldState.channelId && newState.channelId;
        const leftVoice = oldState.channelId && !newState.channelId;
        const movedVoice = oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId;

        if (joinedVoice || movedVoice && !voiceSessions.has(key)) {
            voiceSessions.set(key, now);
            return;
        }

        if (leftVoice || (movedVoice && voiceSessions.has(key))) {
            const joinedAt = voiceSessions.get(key);
            if (!joinedAt) {
                if (newState.channelId) voiceSessions.set(key, now);
                return;
            }

            const durationMs = now - joinedAt;
            const durationMinutes = Math.floor(durationMs / 60000);

            if (durationMinutes > 0) {
                try {
                    const today = new Date().toDateString();

                    const data = await UserStat.findOne({ guild: guildId, user: userId });
                    const lastDate = data?.lastVoiceDate ? new Date(data.lastVoiceDate).toDateString() : null;
                    const isNewDay = lastDate !== today;

                    await UserStat.findOneAndUpdate(
                        { guild: guildId, user: userId },
                        {
                            $inc: {
                                voiceTime: durationMinutes,
                                dailyVoiceTime: isNewDay ? 0 : durationMinutes
                            },
                            $set: {
                                dailyVoiceTime: isNewDay ? durationMinutes : undefined,
                                lastVoiceDate: new Date(),
                                isInVoice: !!newState.channelId
                            }
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.error('Error tracking voice stat:', err);
                }
            }

            if (newState.channelId) {
                voiceSessions.set(key, now);
            } else {
                voiceSessions.delete(key);
            }
        }
    });

};
