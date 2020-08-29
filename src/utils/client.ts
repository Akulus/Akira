import { Client } from 'discord.js';
import RadioManager from './radioManager';
import CommandManager from './commandManager';

export default class AkiraClient extends Client {
    constructor() {
        super({
            shards: 'auto',
            shardCount: 1,
            messageCacheMaxSize: 0,
            messageCacheLifetime: 120,
            messageSweepInterval: 360,
            fetchAllMembers: false,
            disableMentions: 'all',
            ws: {
                large_threshold: 50,
                intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'GUILD_EMOJIS']
            }
        });

        this.on('message', async (msg) => await this.commandManager.parseMessage(msg));
    }

    public readonly radioManager = new RadioManager(this)
    public readonly commandManager = new CommandManager(this)

    /**
     * Initializes all required operations to launch bot shard.
     * @param {string} [token]
     * @returns {TypeError | void}
     */
    launch(token: string): TypeError | void {
        if (!token || token === '' || typeof token !== 'string') return new TypeError('Could not find valid bot token.');

        console.log('[Initialization] Launching bot instance... Loading commands...');
        this.commandManager.registerCommands();
        console.log('[Initialization] Finished! Logging into discord gateway...');
        this.login(token)
            .then(() =>
                console.log(
                    `[READY] Successfully connected to discord servers.\nDetected ${this.guilds.cache.size} guild(s) which have total ${this.users.cache.size} member(s).`
                )
            )
            .catch(() => {
                return new TypeError('Used bot token is invalid or discord servers are currently down.');
            });
    }
}
