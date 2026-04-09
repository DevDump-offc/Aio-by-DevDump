module.exports = async (client) => {
    client.on('interactionCreate', async (interaction) => {

        if (interaction.isButton()) {

            if (interaction.customId === 'DELETE_BUT') {
                const isBoss = client.config.boss?.includes(interaction.user.id);
                const isAdmin = interaction.member?.permissions?.has('ADMINISTRATOR');
                if (!isBoss && !isAdmin) {
                    return interaction.reply({ content: 'You do not have permission to delete this message.', ephemeral: true });
                }
                await interaction.message.delete().catch(() => null);
                return;
            }

            // ===== FIX ADDED HERE =====
            const commands = client.commands;

            if (!commands) return;

            for (const cmd of commands.values()) {
                if (cmd.handleButton) {
                    await cmd.handleButton(interaction, client).catch(() => {});
                }
            }
            // ==========================
        }

        if (interaction.isSelectMenu())
            await client.util.selectMenuHandle(interaction)

        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: true }).catch(() => {})
            const cmd = client?.slashCommands?.get(interaction.commandName)
            if (!cmd)
                return interaction.followUp({
                    content: 'This command has been removed from our system.'
                })

            const args = []

            for (let option of interaction.options.data) {
                if (option.type === 'SUB_COMMAND') {
                    if (option.name) args.push(option.name)
                    option.options?.forEach((x) => {
                        if (x.value) args.push(x.value)
                    })
                } else if (option.value) args.push(option.value)
            }
            interaction.member = interaction.guild.members.cache.get(
                interaction.user.id
            )

            cmd.run(client, interaction, args)
        } else if (interaction.isContextMenu()) {
            await interaction.deferReply({ ephemeral: false })
            const command = client.slashCommands.get(interaction.commandName)
            if (command) command.run(client, interaction)
        }
    })
}