import pkg from 'dotenv';
import Client from './util/client.js';
import config from './config.js';
pkg.config();

const client: Client = new Client(
    process.env.BOT_TOKEN,
    {
        autoreconnect: true,
        compress: true,
        connectionTimeout: 30000,
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
        },
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
        maxShards: 'auto' || 1,
        messageLimit: 1,
        opusOnly: false,
        restMode: false,
        seedVoiceConnections: false,
        defaultImageFormat: 'png',
        defaultImageSize: 256,
        reconnectAttempts: Infinity,
        intents: ['guilds', 'guildVoiceStates', 'guildMessages']
    },
    {
        defaultHelpCommand: true,
        description: config.botInfo.description,
        ignoreBots: true,
        ignoreSelf: true,
        name: config.botInfo.botName,
        owner: config.botInfo.ownerName,
        prefix: config.prefix,
        defaultCommandOptions: {
            cooldown: 1500,
            cooldownExclusions: {
                userIDs: config.administrators
            },
            cooldownMessage: '⌛ Wait a little before you give me command again. *(Cooldown)*',
            cooldownReturns: 1,
            deleteCommand: false,
            dmOnly: false,
            errorMessage: '⚠️ Sorry, but I found an unknown problem while executing command. Operation cancelled.',
            guildOnly: true,
            hidden: false,
            restartCooldown: false,
            invalidUsageMessage: '🔎 Missing arguments. Use `help <command name>` to get more info.'
        }
    }
);

client.connect();
