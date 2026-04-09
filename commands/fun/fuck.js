const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "fuck",
    aliases: ["f"],
    description: "Fuck someone.",
    category: "fun",
    cooldown: 5,
    premium: false,
    options: [
        {
            name: "user",
            description: "The user you want to fuck.",
            type: 6,
            required: true,
        }
    ],
    run: async (client, message, args) => {
        try {

            const target = message.mentions.users.first() 
                || (args[0] ? await message.client.users.fetch(args[0].replace(/[<@!>]/g, '')).catch(() => null) : null);

            if (!target) return message.reply("Please provide a valid user.");

            if (target.id === "1247600439331917916" && message.author.id !== "1247600439331917916") {
                const embed = new MessageEmbed()
                    .setDescription("Nahh, Don't try again bro!.")
                    .setColor(client.color);

                return message.channel.send({ embeds: [embed] });
            }

            if (target.id === message.author.id) {
                return message.reply("You cannot fuck yourself. 💀");
            }

            let gifs = [
                "https://giphy.com/gifs/omg-oh-my-god-woooow-SWhWmKUFYA7ZB6i3pv",
                "https://giphy.com/gifs/louder-loude-toge-fahhh-MsjMsPMFFIJIROCYpM"
            ];

            let gif = gifs[Math.floor(Math.random() * gifs.length)];

            let embed = new MessageEmbed()
                .setDescription(`**${message.author.username} fucked ${target.username}**`)
                .setImage(gif)
                .setColor(client.color);

            message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            message.reply("Something went wrong.");
        }
        const user = message.mentions.users.first() || message.author;

        if (user.id === "1247600439331917916" && message.author.id !== "1247600439331917916") {
            const embed = new MessageEmbed()
                .setDescription("Nahh, Don't try again bro!.")
                .setColor(client.color)

            return message.channel.send({ embeds: [embed] });
        }
    }
};