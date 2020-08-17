"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const optionsProvider_1 = tslib_1.__importDefault(require("./optionsProvider"));
const logger_1 = tslib_1.__importDefault(require("./logger"));
const commandHandler_1 = tslib_1.__importDefault(require("./commandHandler"));
const player_1 = tslib_1.__importDefault(require("./player"));
class AkiraClient extends discord_js_1.Client {
    constructor() {
        super({
            shards: 'auto',
            //shardCount: 1,
            messageCacheMaxSize: 1,
            messageCacheLifetime: 30,
            messageSweepInterval: 60,
            fetchAllMembers: false,
            disableMentions: 'all',
            restWsBridgeTimeout: 5000,
            restTimeOffset: 500,
            restRequestTimeout: 15000,
            restSweepInterval: 60,
            retryLimit: 3,
            ws: {
                large_threshold: 250,
                intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES']
            }
        });
        this.log = new logger_1.default().log;
        this.config = optionsProvider_1.default();
        this.commands = new discord_js_1.Collection();
        this.player = new player_1.default(this);
    }
    /**
     * Initialize client construction.
     * @returns {void}
     */
    init() {
        this.log('Initializing project...');
        this.log('Executing command handler...');
        commandHandler_1.default(this);
        this.log('Connecting with the discord gateway...');
        this.login(this.config.keys.botToken)
            .then(() => this.log('Successfully connected to discord servers.', 'ready'))
            .catch((error) => this.log(`Could not connect to the discord gateway.\n${error}`, 'error'));
    }
}
exports.default = AkiraClient;
