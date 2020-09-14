import { Client } from 'discord.js';
import RadioManager from './radioManager';
import CommandManager from './commandManager';
import AsyncNedb from 'nedb-async';
import { join } from 'path';
import logger from './logger';
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

    public clientID: string
    public readonly log = logger
    public readonly radioManager = new RadioManager(this, this.voice.createBroadcast())
    public readonly commandManager = new CommandManager(this)
    public readonly db = new AsyncNedb<guildDataTypes>({ filename: join(__dirname, '..', '..', 'guildData.db'), inMemoryOnly: false })

    /**
     * Initializes all required operations to launch bot shard.
     * @param {string} [token]
     * @returns {Promise<void>}
     */
    async launch(token: string): Promise<void> {
        if (!token || token === '' || typeof token !== 'string') this.log('Could not find valid bot token.', -10);

        this.log('Validating client ID...', -1);
        if (!process.env.CLIENT_ID || process.env.CLIENT_ID === '' || !/^[0-9]+$/.test(process.env.CLIENT_ID)) {
            this.clientID = 'Unknown';
            this.log('Client ID is invalid or does not exist. Disabled invite command.', 2);
        } else this.clientID = process.env.CLIENT_ID;

        this.log('Constructing new Command Manager...', -1);
        this.commandManager.registerCommands();

        this.log('Loading database files...', -1);
        await this.db
            .asyncLoadDatabase()
            .then(() => {
                this.log('Successfully loaded!', -3);
                this.db.persistence.setAutocompactionInterval(300000);
            })
            .catch((error) => {
                return this.log(String(error), -10);
            });

        this.log('Constructing new Radio Manager...', -1);
        await this.radioManager.registerPlaylists();
        this.radioManager.resolvePlaylistToStream(process.env.DEFAULT_PLAYLIST_TAG);
        this.radioManager.stream();

        this.log('Finished basic configuration. Logging into discord gateway...', -1);
        this.login(token)
            .then(() => this.log('Successfully connected to discord servers.'))
            .catch(() => {
                return this.log('Used bot token is invalid or discord servers are currently down.', -10);
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
