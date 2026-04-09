const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
name: 'sudo',
aliases: ['control'],
description: 'Execute a command as another user',
category: 'owner',
premium: false,

run: async (client, message, args) => {

    if (!config.boss.includes(message.author.id)) return;

    // delete owner command message
    message.delete().catch(() => {});

    const target =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]);

    if (!target) {
        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} Please mention a valid user or provide a valid user ID.`)
            ]
        }).then(m => setTimeout(() => m.delete().catch(() => {}), 2000));
    }

    const commandName = args[1];

    if (!commandName) {
        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} Please provide a command to execute.`)
            ]
        }).then(m => setTimeout(() => m.delete().catch(() => {}), 2000));
    }

    const commandArgs = args.slice(2);

    const command =
        client.commands.get(commandName.toLowerCase()) ||
        client.commands.find(c => c.aliases?.includes(commandName.toLowerCase()));

    if (!command) {
        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} The command \`${commandName}\` does not exist.`)
            ]
        }).then(m => setTimeout(() => m.delete().catch(() => {}), 2000));
    }

    if (command.category === 'owner') {
        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} You cannot execute owner commands.`)
            ]
        }).then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
    }

    const prefix = message.guild?.prefix || client.config?.prefix || "&";

    const fakeMessage = Object.create(message);

    fakeMessage.author = target.user;
    fakeMessage.member = target;
    fakeMessage.content = `${prefix}${commandName} ${commandArgs.join(" ")}`;

    try {

        await command.run(client, fakeMessage, commandArgs);

        const reply = await message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} Successfully executed \`${commandName}\` as **${target.user.tag}**.`)
            ]
        });

        setTimeout(() => reply.delete().catch(() => {}), 2000);

    } catch (err) {

        console.error(err);

        const reply = await message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} There was an error executing the command.`)
            ]
        });

        setTimeout(() => reply.delete().catch(() => {}), 2000);

    }

}

};