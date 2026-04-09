module.exports = async (client) => {
    client.once('ready', async () => {
        await client.user.setPresence({
            activities: [
                {
                    name: 'Fynox | &help',
                    type: 2 // LISTENING
                }
            ],
            status: 'idle'
        });

        // 🔥 Remove ALL global commands
        await client.application.commands.set([]);

        // 🔥 Remove ALL guild commands
        const guilds = await client.guilds.fetch();
        for (const [id] of guilds) {
            const guild = await client.guilds.fetch(id);
            await guild.commands.set([]);
        }

        client.logger.log(`Logged in to ${client.user.tag}`, 'ready');
    });
};