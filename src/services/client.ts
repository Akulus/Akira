import { Client } from 'eris';
import getConfig from './optionsProvider';
import Logger from './logger';
import commandTypes from '../typings/command';
import handleCommands from './commandHandler';

export default class AkiraClient extends Client {
    constructor() {
        super(process.env.CONFIG_DISCORD_BOT_TOKEN, {
            autoreconnect: true,
            compress: true,
            connectionTimeout: 30000,
            allowedMentions: {
                everyone: false,
                roles: false,
                users: false
            },
            firstShardID: 0,
            getAllUsers: false,
            guildCreateTimeout: 2000,
            guildSubscriptions: true,
            largeThreshold: 250,
            latencyThreshold: 30000,
            maxShards: Math.floor(parseInt(process.env.CONFIG_SHARD_COUNT)) || 1,
            messageLimit: 5,
            opusOnly: false,
            restMode: false,
            seedVoiceConnections: false,
            defaultImageFormat: 'jpg',
            defaultImageSize: 256,
            reconnectAttempts: Infinity,
            intents: ['guilds', 'guildVoiceStates', 'guildMessages'],
            disableEvents: {
                GUILD_UPDATE: true,
                CHANNEL_CREATE: true,
                CHANNEL_UPDATE: true,
                CHANNEL_DELETE: true,
                CHANNEL_OVERWRITE_CREATE: true,
                CHANNEL_OVERWRITE_UPDATE: true,
                CHANNEL_OVERWRITE_DELETE: true,
                MEMBER_KICK: true,
                MEMBER_PRUNE: true,
                MEMBER_BAN_ADD: true,
                MEMBER_BAN_REMOVE: true,
                MEMBER_UPDATE: true,
                MEMBER_ROLE_UPDATE: true,
                MEMBER_MOVE: false,
                MEMBER_DISCONNECT: false,
                BOT_ADD: true,
                ROLE_CREATE: true,
                ROLE_UPDATE: true,
                ROLE_DELETE: true,
                INVITE_CREATE: true,
                INVITE_UPDATE: true,
                INVITE_DELETE: true,
                WEBHOOK_CREATE: true,
                WEBHOOK_UPDATE: true,
                WEBHOOK_DELETE: true,
                EMOJI_CREATE: true,
                EMOJI_UPDATE: true,
                EMOJI_DELETE: true,
                MESSAGE_DELETE: true,
                MESSAGE_BULK_DELETE: true,
                MESSAGE_PIN: true,
                MESSAGE_UNPIN: true,
                INTEGRATION_CREATE: true,
                INTEGRATION_UPDATE: true,
                INTEGRATION_DELETE: true
            }
        });
    }

    public readonly log = new Logger().log
    public readonly config = getConfig()
    public readonly commands = new Map<string, commandTypes>()
    public readonly aliases = new Map<string, string>()

    /**
     * Initialize client construction.
     * @returns {void}
     */
    init(): void {
        this.log('Initializing project...');
        this.log('Executing command handler...');
        handleCommands(this);
        this.log('Connecting with the discord gateway...');
        this.connect()
            .then(() => this.log('Successfully connected to discord servers.', 'ready'))
            .catch((error: string) => this.log(`Could not connect to the discord gateway.\n${error}`, 'error'));
    }
}
