const mongoose = require('mongoose');
const UserInvite = require('../models/UserInvite');

module.exports = (client) => {
    client.inviteCache = new Map();
    client.inviteUserMap = new Map();
    const InviteSchema = require('../models/invite');
    const Invite = mongoose.model('Invite', InviteSchema);

    client.on('ready', async () => {
        for (const [guildId, guild] of client.guilds.cache) {
            try {
                const invites = await guild.invites.fetch();
                invites.forEach(inv => client.inviteCache.set(inv.code, inv.uses));
            } catch (err) {
                console.error(`Error fetching invites for guild ${guildId}:`, err);
            }
        }
        console.log('Invite cache initialized.');
    });

    client.on('inviteCreate', async (invite) => {
        try {
            await Invite.create({
                guildId: invite.guild.id,
                inviterId: invite.inviter.id,
                inviteCode: invite.code,
                uses: invite.uses || 0
            });
            console.log(`Invite ${invite.code} created and saved to DB.`);
        } catch (err) {
            console.error('Error saving invite to DB:', err);
        }
    });

    client.on('inviteDelete', async (invite) => {
        try {
            const cachedInvites = client.inviteCache.get(invite.code);
            if (cachedInvites) {
                cachedInvites.deletedTimestamp = Date.now();
                console.log(`Invite ${invite.code} marked as deleted in cache.`);
            }
        } catch (err) {
            console.error('Error deleting invite from DB:', err);
        }
    });

    client.on('guildMemberAdd', async (member) => {
        try {
            const invites = await member.guild.invites.fetch();
            const usedInvite = invites.find(inv => inv.uses > (client.inviteCache.get(inv.code) || 0));

            if (usedInvite) {
                const inviterId = usedInvite.inviter?.id;

                const inviteRecord = await Invite.findOne({ guildId: member.guild.id, inviteCode: usedInvite.code });

                if (inviteRecord) {
                    if (inviteRecord.leavedMembers.includes(member.id)) {
                        inviteRecord.rejoins += 1;
                        inviteRecord.leavedMembers = inviteRecord.leavedMembers.filter(id => id !== member.id);
                    } else {
                        inviteRecord.joins += 1;
                    }
                    inviteRecord.members.push(member.id);
                    inviteRecord.uses = usedInvite.uses;
                    await inviteRecord.save();
                }

                if (inviterId) {
                    client.inviteUserMap.set(`${member.guild.id}-${member.id}`, inviterId);

                    await UserInvite.findOneAndUpdate(
                        { guild: member.guild.id, user: inviterId },
                        { $inc: { invites: 1 } },
                        { upsert: true, new: true }
                    );
                }

                client.inviteCache.set(usedInvite.code, usedInvite.uses);
            }
        } catch (err) {
            console.error('Error handling member join:', err);
        }
    });

    client.on('guildMemberRemove', async (member) => {
        try {
            const inviteRecord = await Invite.findOne({ guildId: member.guild.id, members: member.id });

            if (inviteRecord) {
                inviteRecord.leaves += 1;
                inviteRecord.leavedMembers.push(member.id);
                await inviteRecord.save();
            }

            const inviterId = client.inviteUserMap.get(`${member.guild.id}-${member.id}`);
            if (inviterId) {
                await UserInvite.findOneAndUpdate(
                    { guild: member.guild.id, user: inviterId },
                    { $inc: { leaves: 1 } },
                    { upsert: true }
                );
                client.inviteUserMap.delete(`${member.guild.id}-${member.id}`);
            }
        } catch (err) {
            console.error('Error handling member leave:', err);
        }
    });
};
