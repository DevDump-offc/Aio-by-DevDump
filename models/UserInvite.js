const mongoose = require('mongoose');

const userInviteSchema = new mongoose.Schema({
    guild: { type: String, required: true },
    user: { type: String, required: true },
    invites: { type: Number, default: 0 },
    fake: { type: Number, default: 0 },
    leaves: { type: Number, default: 0 }
});

userInviteSchema.index({ guild: 1, user: 1 }, { unique: true });

module.exports = mongoose.models.UserInvite || mongoose.model('UserInvite', userInviteSchema);
