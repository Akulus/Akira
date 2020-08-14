import { Client, Collection } from 'discord.js';
import getConfig from './optionsProvider';
import Logger from './logger';
import commandTypes from '../typings/command';
import handleCommands from './commandHandler';

export default class AkiraClient extends Client {
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
    }

    public readonly log = new Logger().log
    public readonly config = getConfig()
    public readonly commands = new Collection<string, commandTypes>()

    /**
     * Initialize client construction.
     * @returns {void}
     */
    init(): void {
        this.log('Initializing project...');
        this.log('Executing command handler...');
        handleCommands(this);
        this.log('Connecting with the discord gateway...');
        this.login(this.config.keys.botToken)
            .then(() => this.log('Successfully connected to discord servers.', 'ready'))
            .catch((error: string) => this.log(`Could not connect to the discord gateway.\n${error}`, 'error'));
    }
}
