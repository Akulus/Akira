import { Client } from 'discord.js';
import RadioManager from './radioManager';
import CommandManager from './commandManager';
import AsyncNedb from 'nedb-async';
import { join } from 'path';
import guildDataTypes from '../typings/database';

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
                intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES']
            }
        });

        this.on('message', async (msg) => await this.commandManager.parseMessage(msg));
        this.on('voiceStateUpdate', async (oldState, newState) => await this.radioManager.triggerMovement(oldState, newState));
    }

    public readonly radioManager = new RadioManager(this, this.voice.createBroadcast())
    public readonly commandManager = new CommandManager(this)
    public readonly db = new AsyncNedb<guildDataTypes>({ filename: join(__dirname, '..', '..', 'guildData.db'), inMemoryOnly: false })

    /**
     * Initializes all required operations to launch bot shard.
     * @param {string} [token]
     * @returns {TypeError | void}
     */
    launch(token: string): TypeError | void {
        if (!token || token === '' || typeof token !== 'string') return new TypeError('Could not find valid bot token.');

        console.log('[Initialization] Launching bot instance... Loading commands...');
        this.commandManager.registerCommands();

        console.log('[Initialization] Loading database...');
        this.db
            .asyncLoadDatabase()
            .then(() => {
                console.log('[Database] Successfully loaded.');
                this.db.persistence.setAutocompactionInterval(300000);
            })
            .catch((error) => {
                return new TypeError(error);
            });

        console.log('[Initialization] Starting radio station...');
        this.radioManager.streamNext(0);

        console.log('[Initialization] Finished! Logging into discord gateway...');
        this.login(token)
            .then(() => console.log('[READY] Successfully connected to discord servers.'))
            .catch(() => {
                return new TypeError('Used bot token is invalid or discord servers are currently down.');
            });
    }

    /**
     * Simple function to check if object is empty or not.
     * @param {Object} [obj] //eslint-disable-line
     * @returns {boolean}
     */
    //eslint-disable-next-line
    isEmpty(obj: Object): boolean {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) return false //eslint-disable-line
        }
        return true;
    }
}
