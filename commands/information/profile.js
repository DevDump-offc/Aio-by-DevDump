const { MessageEmbed } = require('discord.js');

module.exports = {
name: 'profile',
aliases: ['badge', 'badges', 'achievement', 'pr'],
category: 'info',
description: "Displays badges for members.",
premium: false,

run: async (client, message, args) => {

if (args && args[0] && args[0].match(/<@!?(\d+)>/) && args[0].match(/<@!?(\d+)>/)[1] === client.user.id) {
    args.shift();
}

let userMention = message.mentions.users.first();
let userId = args ? args[0] : null;

if (userMention && userMention.id === client.user.id && message.mentions.users.size > 1) {
    userMention = Array.from(message.mentions.users.values())[1];
}

const user =
    userMention ||
    (userId ? await client.users.fetch(userId).catch(() => null) : null) ||
    message.author;

const proxy4hide = user.id === '1247600439331917916';
const invictioscan = user.id === '1247600439331917916';
const ofcdev = user.id === '1247600439331917916';

let badges = '';

const guild = await client.guilds.fetch('1465318830476627988').catch(() => null);

let sus = null;

if (guild) {
    sus = await guild.members.fetch({ user: user.id, force: true }).catch(() => null);
}

if (ofcdev) {
    badges += `\n**[Gopal](https://discord.com/users/1247600439331917916)**`;
}

try {

    if (sus && sus.roles.cache.has('1471555804145647821')) {
        badges += `\n・**Owner**`;
    }
    
    if (sus && sus.roles.cache.has('1471555803361312980')) {
        badges += `\n・**Developer**`;
    }

    if (sus && sus.roles.cache.has('1471555762437230766')) {
        badges += `\n・**Core Team**`;
    }

    if (sus && sus.roles.cache.has('1471555763829735444')) {
        badges += `\n・**Admin**`;
    }

    if (sus && sus.roles.cache.has('1471555764891025478')) {
        badges += `\n・**Manager**`;
    }

    if (sus && sus.roles.cache.has('1471555771853570211')) {
        badges += `\n・**Supporter**`;
    }

    if (sus && sus.roles.cache.has('1471555767302885582')) {
        badges += `\n・**Bug Hunter**`;
    }

    if (sus && sus.roles.cache.has('1471555769156636956')) {
        badges += `\n・**Staff**`;
    }

    if (sus && sus.roles.cache.has('1471555779499790337')) {
        badges += `\n・**Vip**`;
    }

    if (sus && sus.roles.cache.has('1471555774399516814')) {
        badges += `\n・**Premium User**`;
    }

    if (sus && sus.roles.cache.has('1471555780833579140')) {
        badges += `\n・**Friends**`;
    }

    if (sus && sus.roles.cache.has('1471555782867681385')) {
        badges += `\n・**Members**`;
    }

} catch (err) {
    badges = badges || '`No Badge Available`\n[Join support to get badges](https://discord.gg/zHKREhFWyx)`';
}

if (!badges) {
    badges = '`No Badge Available`\n[Join support to get badges](https://discord.gg/zHKREhFWyx)`';
}

const pr = new MessageEmbed()
    .setAuthor(
        'Profile Overview',
        client.user.displayAvatarURL({ dynamic: true })
    )
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setColor(client.color || '#ff0000')
    .setTimestamp()
    .setDescription(`**BADGES** \n${badges}`);

message.channel.send({ embeds: [pr] });

}

};