const { MessageEmbed, MessageActionRow, MessageButton, Permissions, Collection, WebhookClient } = require('discord.js')

const Fynox = ["1247600439331917916", "1247600439331917916", "1247600439331917916"]

const cooldowns = new Collection()

module.exports = async (client) => {

client.on('messageCreate', async (message) => {

if (!message || !message.guild) return
if (message.author.bot) return

try {

let check = await client.util.BlacklistCheck(message?.guild)
if (check) return

let uprem = await client.db.get(`uprem_${message.author.id}`)
let upremend = await client.db.get(`upremend_${message.author.id}`)

let sprem = await client.db.get(`sprem_${message.guild.id}`)
let spremend = await client.db.get(`spremend_${message.guild.id}`)

let scot = 0
let slink = 'https://discord.gg/zHKREhFWyx'


/* ================= BOT MENTION ================= */

const row = new MessageActionRow().addComponents(

new MessageButton()
.setLabel(`Invite Me`)
.setStyle('LINK')
.setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`),

new MessageButton()
.setLabel(`Support`)
.setStyle('LINK')
.setURL(`https://discord.gg/zHKREhFWyx`)

)

await client.util.setPrefix(message, client)
await client.util.noprefix()
await client.util.blacklist()

let blacklistdb = Array.isArray(client.blacklist) ? client.blacklist : []

if (
blacklistdb.includes(message.author.id) &&
!client.config.boss.includes(message.author.id)
) return


let user = await client.users.fetch(`1247600439331917916`).catch(()=>null)


if (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`) {

const cooldownKey = `${message.guild.id}-${message.author.id}`

if (cooldowns.has(cooldownKey)) {

const expirationTime = cooldowns.get(cooldownKey) + 2700

if (Date.now() < expirationTime) return

}

cooldowns.set(cooldownKey, Date.now())

return message.channel.send({

embeds:[
new MessageEmbed()
.setAuthor({
name:`I'm ${client.user.username}`,
iconURL:client.user.displayAvatarURL({dynamic:true})
})
.setColor(client.color)
.setThumbnail(message.author.displayAvatarURL({dynamic:true}))
.setDescription(
`Hey ${message.author.username}

Prefix For This Server Is \`${message.guild.prefix}\`

Unlock more commands with \`${message.guild.prefix}help\`.`
)
.setFooter({
text:`Fynox on Top!??`,
iconURL:user?.displayAvatarURL({dynamic:true})
})
],

components:[row]

})

}


/* ================= PREFIX HANDLER ================= */

let prefix = message.guild.prefix ?? "&"

let datab = Array.isArray(client.noprefix) ? client.noprefix : []

const mentionRegex = new RegExp(`<@!?${client.user.id}>`)

let isMention = mentionRegex.test(message.content)

if (isMention) {
message.content = message.content.replace(mentionRegex, '')
}

const isNoPrefixUser = datab.some(user =>
typeof user === 'string'
? user === message.author.id
: user?.userId === message.author.id
)

if (!isMention && !isNoPrefixUser && !message.content.startsWith(prefix)) return

const args = message.content.startsWith(prefix)
? message.content.slice(prefix.length).trim().split(/ +/)
: message.content.trim().split(/ +/)

const cmd = args.shift()

if (!cmd) return

const commandName = cmd.toLowerCase()

if (!cmd) return


/* ================= COMMAND FETCH ================= */

const command =
client.commands.get(commandName) ||
client.commands.find(c => c.aliases?.includes(commandName))


/* ================= COMMAND EXECUTION ================= */

if (command) {

const aiChannel = await client.db?.get(`aiChannel_${message.guild.id}`)

if (aiChannel?.channelId === message.channel.id) return

const ignore = (await client.db?.get(`ignore_${message.guild.id}`)) ?? { channel:[], role:[] }

let isSpecialMember = Fynox.includes(message.author.id)

if (
!isSpecialMember &&
ignore.channel.includes(message.channel.id) &&
!message.member.roles.cache.some(role => ignore.role.includes(role.id))
) {

return await message.channel.send({

embeds:[
new MessageEmbed()
.setColor(client.color)
.setDescription(
`Sorry, I can't run commands here.

Try another channel or contact an admin.`
)
]

}).then(x => {

setTimeout(()=>x.delete().catch(()=>{}),3000)

})

}


if (
!client.config.boss.includes(message.author.id) &&
command.category === 'owner'
) return


if (command.premium === true) {
    const isPremActive = sprem === 'true' && spremend && Date.now() < spremend
    if (!isPremActive) {
        const premRow = new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel('Get Premium')
                .setStyle('LINK')
                .setURL(slink)
        )
        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`This command requires **[Premium](${slink})**.\nThis server does not have an active premium subscription.\n\nActivate premium with \`${message.guild.prefix ?? '&'}premium activate\` or [click here](${slink}) to get premium.`)
            ],
            components: [premRow]
        })
    }
}


try {
    await command.run(client, message, args)
} catch (cmdErr) {
    console.error(`Error in command [${commandName}]:`, cmdErr)
    message.channel.send({
        embeds: [
            new MessageEmbed()
                .setColor('#FF0000')
                .setDescription(`An error occurred while running this command.\n\`\`\`${cmdErr.message}\`\`\``)
        ]
    }).catch(() => {})
}

}

} catch(err) {

console.error(err)

}

})

}