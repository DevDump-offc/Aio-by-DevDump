const mongoose = require('mongoose');

const userStatSchema = new mongoose.Schema({
    guild: { type: String, required: true },
    user: { type: String, required: true },
    messages: { type: Number, default: 0 },
    dailyMessages: { type: Number, default: 0 },
    lastMessageDate: { type: Date, default: Date.now },
    voiceTime: { type: Number, default: 0 },
    dailyVoiceTime: { type: Number, default: 0 },
    lastVoiceDate: { type: Date },
    isInVoice: { type: Boolean, default: false },
    voiceJoinTimestamp: { type: Date }
});

userStatSchema.index({ guild: 1, user: 1 }, { unique: true });

module.exports = mongoose.models.UserStat || mongoose.model('UserStat', userStatSchema);
