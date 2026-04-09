const { ActivityType } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'rr',
  description: 'Reload bot RPC',

  async run(client, message, args) {
    if (!config.boss.includes(message.author.id)) return;

    try {
      await message.channel.send('Reloading RPC...');

      // ✅ Step 1: Change activity ONLY (no invisible)
      await client.user.setPresence({
        status: 'dnd',
        activities: [
          {
            name: 'Reloading...',
            type: ActivityType.Playing
          }
        ]
      });

      // ✅ Small delay
      await new Promise(res => setTimeout(res, 2000));

      // ✅ Step 2: Set actual RPC
      await client.user.setPresence({
        status: 'idle',
        activities: [
          {
            name: 'Fynox | &help',
            type: ActivityType.Playing
          }
        ]
      });

      await message.channel.send('RPC Reloaded Successfully');

    } catch (err) {
      console.error(err);
      await message.channel.send('RPC Reload Failed');
    }
  }
};