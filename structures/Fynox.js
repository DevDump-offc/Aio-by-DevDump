const { Client, Collection, Intents, WebhookClient, ShardClientUtil } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');
const Utils = require('./util');
const { Database } = require('quickmongo');
const axios = require('axios');
const Sweepers = require('./Sweepers');
const { QuickDB } = require('quick.db');

module.exports = class Fynox extends Client {
    constructor() {
        super({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.MESSAGE_CONTENT,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],
            fetchAllMembers: false,
            shards: 'auto',
            allowedMentions: {
                parse: ['users'],
            }
        });

        this.config = require(`${process.cwd()}/config.json`);
        this.emoji = require(`${process.cwd()}/emojis.json`);
        this.logger = require('./logger');
        this.commands = new Collection();
        this.categories = fs.readdirSync('./commands/');
        this.util = new Utils(this);
        this.Sweeper = new Sweepers(this);
        this.color = `#2b2d31`;
        this.support = `https://discord.gg/zHKREhFWyx`;
        this.cooldowns = new Collection();
        this.snek = require('axios');

        this.ratelimit = new WebhookClient({
            url: 'https://discord.com/api/webhooks/1485160434582552707/79oIgp_ihuWHqFfcsjbPu6rQUANmmbnyjSSTzMZagFFqOsWQ0FKtAs3PqpdQvTvVHkHY'
        });

        this.error = new WebhookClient({
            url: 'https://discord.com/api/webhooks/1485160434582552707/79oIgp_ihuWHqFfcsjbPu6rQUANmmbnyjSSTzMZagFFqOsWQ0FKtAs3PqpdQvTvVHkHY'
        });

        this.errorHandling();
        this.rateLimitHandling();
    }

    errorHandling() {
        this.on('error', (error) => {
            if (this.error) this.error.send(`\`\`\`js\n${error.stack}\`\`\``).catch(() => {});
        });

        process.on('unhandledRejection', (error) => {
            console.error('Unhandled Rejection:', error);
        });

        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
        });
    }

    rateLimitHandling() {
        this.on('rateLimit', (info) => {
            let messageContent = `\`\`\`js\nTimeout: ${info.timeout},\nLimit: ${info.limit},\nMethod: ${info.method},\nPath: ${info.path},\nRoute: ${info.route},\nGlobal: ${info.global}\`\`\``;

            if (info.global) {
                messageContent = `@everyone\n${messageContent}`;
            }

            if (this.ratelimit) this.ratelimit.send({ content: messageContent }).catch(() => {});
        });
    }

    async initializedata() {
        this.data = new QuickDB();
        this.logger.log(`Connecting to Sql...`);
        this.logger.log('Sql Database Connected', 'ready');
    }

    async initializeSecondMongoose() {
        if (!this.config.MONGO_DB1) return;

        this.secondDb = new Database(this.config.MONGO_DB1);
        await this.secondDb.connect();

        this.logger.log('Second MongoDB Connected', 'ready');
    }

    async initializeMongoose() {
        if (!this.config.MONGO_DB) return;

        this.db = new Database(this.config.MONGO_DB);
        await this.db.connect();

        this.logger.log(`Connecting to MongoDb...`);

        await mongoose.connect(this.config.MONGO_DB);

        this.logger.log('Mongoose Database Connected', 'ready');

        await this.initializeSecondMongoose();
    }

    async loadEvents() {
        const eventFiles = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            try {
                const event = require(`${process.cwd()}/events/${file}`);

                if (typeof event === 'function') {
                    await event(this);
                    this.logger.log(`Loaded Event ${file}.`, 'event');
                }

            } catch (error) {
                console.error(`Error loading event file ${file}:`, error);
            }
        }
    }

    async loadlogs() {
        if (!fs.existsSync('./logs/')) return;

        fs.readdirSync('./logs/').forEach((file) => {
            try {

                let logevent = file.split('.')[0];

                require(`${process.cwd()}/logs/${file}`)(this);

                this.logger.log(`Updated Logs ${logevent}.`, 'event');

            } catch (error) {
                console.error(`Error loading log file ${file}:`, error);
            }
        });
    }

    async loadMain() {
        const commandFiles = [];
        const commandDirectories = fs.readdirSync(`${process.cwd()}/commands`);

        for (const directory of commandDirectories) {

            const path = `${process.cwd()}/commands/${directory}`;

            if (fs.lstatSync(path).isDirectory()) {

                const files = fs.readdirSync(path).filter((file) => file.endsWith('.js'));

                for (const file of files) {
                    commandFiles.push(`${path}/${file}`);
                }

            }

        }

        commandFiles.map((value) => {

            const file = require(value);

            const splitted = value.split('/');

            const directory = splitted[splitted.length - 2];

            if (file.name) {

                const properties = { directory, ...file };

                this.commands.set(file.name, properties);

            }

        });

        this.logger.log(`Total Commands ${this.commands.size} Commands.`, 'cmd');
    }

}