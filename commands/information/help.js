const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: `Show's the help command.`,
    category: 'info',
    premium: false,
    run: async (client, message, args) => {

        let prefix = message.guild?.prefix || '&';
        const query = args[0];

        const getTotalCommandCount = () => {
            let total = 0;
            client.commands.forEach(cmd => {
                total += 1;
                if (cmd.subcommand && cmd.subcommand.length > 0) {
                    total += cmd.subcommand.length;
                }
            });
            return total;
        };

        const formatCommandWithSubcommands = (cmd) => {
            let formattedCommands = [`\`${cmd.name}\``];
            if (cmd.subcommand && cmd.subcommand.length > 0) {
                formattedCommands = formattedCommands.concat(
                    cmd.subcommand.map(sub => `\`${cmd.name} ${sub}\``)
                );
            }
            return formattedCommands.join(', ');
        };

        if (query) {

            const command =
                client.commands.get(query) ||
                client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(query));

            if (!command || command.category === 'owner') {
                return message.reply('Command not found!');
            }

            const aliases = command.aliases && command.aliases.length > 0
                ? `\`${command.aliases.join(', ')}\``
                : 'None';

            const embed = new MessageEmbed()
                .setColor(client.color)
                .setDescription(command.description || 'No description available.');

            embed.addField('Aliases', `${aliases}`);

            if (command.subcommand && command.subcommand.length > 0) {
                const allCommands = [`\`${command.name}\``].concat(
                    command.subcommand.map(sub => `\`${command.name} ${sub}\``)
                );
                embed.addField('Available Commands', allCommands.join(', '));
            }

            if (typeof command.premium !== 'undefined') {
                embed.addField('Premium', command.premium ? `\`Yes\`` : `\`No\``);
            }

            embed.addField('Usage', `\`${prefix}${command.name}${command.subcommand ? ' <subcommand>' : ''}\``);

            let Fynox = await client.users.fetch(`1247600439331917916`);

            embed
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `Fynox on Top ???`,
                    iconURL: Fynox.displayAvatarURL({ dynamic: true })
                });

            return message.channel.send({ embeds: [embed] });
        }

        const selectMenu = new MessageSelectMenu()
            .setCustomId('categorySelect')
            .setPlaceholder('Select a module')
            .addOptions([
                { label: 'Home', value: 'home', description: 'Return to main menu', emoji: '1478238180011675743' },
                { label: 'AntiNuke', value: 'antinuke', description: 'Commands related to AntiNuke', emoji: '1478238188278648918' },
                { label: 'Moderation', value: 'mod', description: 'Commands related to Moderation', emoji: '1478238169479643298' },
                { label: 'Utility', value: 'info', description: 'Utility commands', emoji: '1478238152157171722' },
                { label: 'Welcomer', value: 'welcomer', description: 'Commands for Welcomer', emoji: '1478238146780070079' },
                { label: 'Selfrole', value: 'Selfrole', description: 'Commands for Selfrole', emoji: '1478238167466250433' },
                { label: 'Advance Automod', value: 'automod', description: 'Commands for Advance Automod', emoji: '1478238186487419095' },
                { label: 'Custom Role', value: 'customrole', description: 'Commands for Custom Roles', emoji: '1478238181848776726' },
                { label: 'Logging', value: 'logging', description: 'Commands for Logging', emoji: '1478238164102414390' },
                { label: 'Server Activity', value: 'Server Utility', description: 'Commands for Server Activity', emoji: '1478238164102414390' },
                { label: 'Sticky Message', value: 'Sticky Message', description: 'Commands for Sticky Message', emoji: '1478238156137566471' },
                { label: 'Giveaway', value: 'Giveaway', description: 'Commands for Giveaway', emoji: '1478238173887860818' },
                { label: 'Autorespond', value: 'Autorespond', description: 'Commands for Autorespond', emoji: '1478238184700903466' },
                { label: 'Fun', value: 'Fun', description: 'Commands for Fun', emoji: '1478238176517689385' },
            ]);

        const buttons = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('home').setLabel('Home').setStyle('SECONDARY'),
            new MessageButton().setCustomId('delete').setLabel('Delete').setStyle('DANGER'),
            new MessageButton()
                .setLabel('Invite Me')
                .setStyle('LINK')
                .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`)
        );

        const initialEmbed = new MessageEmbed()
            .setColor(client.color)
            .setAuthor({ name: `${client.user.username} Help Menu`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(`Hello! I'm Fynox, Your Bot For Your Server!\nSecurity With Powerful Antinuke Features.\n\nPrefix For This Server \`${prefix}\`\nTotal Commands \`${getTotalCommandCount()}\``)
            .addField(
                '__Main Modules__',
                `${client.emoji.antinuke} **AntiNuke**\n${client.emoji.moderation} **Moderation**\n${client.emoji.utility} **Utility**\n${client.emoji.welcomer} **Welcomer**\n${client.emoji.reaction_role} **Reaction Role**\n${client.emoji.customrole} **Customrole**\n${client.emoji.server_utility} **Logging**\n${client.emoji.server_utility} **Server Activity**\n${client.emoji.sticky} **Sticky Message**\n${client.emoji.automod} **Advance Automod**\n${client.emoji.giveaway} **Giveaway**\n${client.emoji.autoresponder} **Autorespond**\n${client.emoji.fun} **Fun**`,
                false
            )
            .addField('Links', `**[Invite](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot) | [Support](https://discord.gg/zHKREhFWyx)**`, true);

        const helpMessage = await message.channel.send({
            embeds: [initialEmbed],
            components: [new MessageActionRow().addComponents(selectMenu), buttons]
        });

        const collector = helpMessage.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 120000
        });

        collector.on('collect', async (i) => {

            if (i.isButton()) {

                if (i.customId === 'home')
                    await helpMessage.edit({ embeds: [initialEmbed] });

                else if (i.customId === 'delete')
                    await helpMessage.delete();

                i.deferUpdate().catch(() => {});
            }

            else if (i.isSelectMenu()) {

                const category = i.values[0];

                if (category === 'home') {
                    await helpMessage.edit({ embeds: [initialEmbed] });
                    i.deferUpdate().catch(() => {});
                    return;
                }

                let filteredCommands = [];

                switch (category) {
                    case 'antinuke': filteredCommands = client.commands.filter((x) => x.category === 'security').map(formatCommandWithSubcommands); break;
                    case 'mod': filteredCommands = client.commands.filter((x) => x.category === 'mod').map(formatCommandWithSubcommands); break;
                    case 'info': filteredCommands = client.commands.filter((x) => x.category === 'info').map(formatCommandWithSubcommands); break;
                    case 'welcomer': filteredCommands = client.commands.filter((x) => x.category === 'welcomer').map(formatCommandWithSubcommands); break;
                    case 'voice': filteredCommands = client.commands.filter((x) => x.category === 'voice').map(formatCommandWithSubcommands); break;
                    case 'automod': filteredCommands = client.commands.filter((x) => x.category === 'automod').map(formatCommandWithSubcommands); break;
                    case 'customrole': filteredCommands = client.commands.filter((x) => x.category === 'customrole').map(formatCommandWithSubcommands); break;
                    case 'logging': filteredCommands = client.commands.filter((x) => x.category === 'logging').map(formatCommandWithSubcommands); break;
                    case 'Giveaway': filteredCommands = client.commands.filter((x) => x.category === 'give').map(formatCommandWithSubcommands); break;
                    case 'Autorespond': filteredCommands = client.commands.filter((x) => x.category === 'autores').map(formatCommandWithSubcommands); break;
                    case 'Fun': filteredCommands = client.commands.filter((x) => x.category === 'fun').map(formatCommandWithSubcommands); break;
                    case 'Selfrole': filteredCommands = client.commands.filter((x) => x.category === 'rrole').map(formatCommandWithSubcommands); break;
                    case 'Server Utility': filteredCommands = client.commands.filter((x) => x.category === 'serveru').map(formatCommandWithSubcommands); break;
                    case 'Sticky Message': filteredCommands = client.commands.filter((x) => x.category === 'sticky').map(formatCommandWithSubcommands); break;
                }

                const updatedEmbed = new MessageEmbed(initialEmbed)
                    .setDescription(`**${category.charAt(0).toUpperCase() + category.slice(1)} Commands**\n${filteredCommands.join(', ')}`);

                updatedEmbed.fields = [];

                await helpMessage.edit({ embeds: [updatedEmbed] });

                i.deferUpdate().catch(() => {});
            }
        });

        collector.on('end', () => {

            selectMenu.setDisabled(true);
            buttons.components.forEach(button => button.setDisabled(true));

            helpMessage.edit({
                components: [new MessageActionRow().addComponents(selectMenu), buttons]
            }).catch(() => {});
        });

        const otherUserCollector = helpMessage.createMessageComponentCollector({
            filter: (i) => i.user.id !== message.author.id,
            time: 120000
        });

        otherUserCollector.on('collect', async (i) => {
            await i.reply({ content: 'This is not your interaction.', ephemeral: true });
        });

        setTimeout(async () => {

            selectMenu.setDisabled(true);
            buttons.components.forEach(button => button.setDisabled(true));

            await helpMessage.edit({
                components: [new MessageActionRow().addComponents(selectMenu), buttons],
                embeds: [initialEmbed]
            }).catch(() => {});

        }, 120000);
    }
};