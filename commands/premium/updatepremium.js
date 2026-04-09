const { MessageEmbed } = require('discord.js')
this.config = require(`${process.cwd()}/config.json`)

module.exports = {
    name: 'updatepremium',
    aliases: ['updateprem', 'upremium', '+++'],
    category: 'owner',
    run: async (client, message, args) => {
        const em1 = new MessageEmbed()
        let time
        let count
        if (!this.config.prem.includes(message.author.id)) return
        const embed = new MessageEmbed().setColor(client.color)
        if (args[0]) {
            try {
                await client.users.fetch(args[0])
            } catch (error) {
                return message.channel.send('Invalid Id')
            }
            if (args[1]) {
                let timeInput = args[1];
                let amount = parseInt(timeInput.slice(0, -1));
                let unit = timeInput.slice(-1).toLowerCase();

                if (isNaN(amount)) {
                    amount = parseInt(timeInput);
                    unit = 'd';
                }

                let expirationDate = new Date();
                if (unit === 'd') expirationDate.setDate(expirationDate.getDate() + amount);
                else if (unit === 'm') expirationDate.setMonth(expirationDate.getMonth() + amount);
                else if (unit === 'y') expirationDate.setFullYear(expirationDate.getFullYear() + amount);
                else expirationDate.setDate(expirationDate.getDate() + amount);

                time = expirationDate.getTime();
            } else if (!args[1]) {
                time = await client.db.get(`upremend_${args[0]}`)
            }
            if (args[2]) {
                count = parseInt(args[2])
            }
            if (!args[2]) {
                count = parseInt(await client.db.get(`upremcount_${args[0]}`) || 0)
            }
            await client.db.set(`uprem_${args[0]}`, `true`)
            await client.db.set(`upremend_${args[0]}`, time)
            await client.db.set(`upremcount_${args[0]}`, count)
            return message.channel.send({
                embeds: [
                    embed.setDescription(
                        `<@${
                            args[0]
                        }>'s Premium Has Been Updated\nPremium Count - \`${count}\`    Premium Expiring - <t:${Math.round(
                            time / 1000
                        )}:F>`
                    )
                ]
            })
        } else
            return message.channel.send({
                embeds: [embed.setDescription(`Please Give The User Id`)]
            })
    }
}
/*
Math.round((Date.now() + 86400000 * 1) / 1000)
*/
