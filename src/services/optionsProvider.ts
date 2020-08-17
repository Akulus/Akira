import configTypes from '../typings/dotenv-config';

/**
 * Return config object.
 * @returns {configTypes}
 */
export default function getConfig(): configTypes {
    // Construct config object
    const config: configTypes = {
        keys: {
            botToken: null,
            youtubeAPI: null
        },
        botOptions: {
            owners: null,
            prefix: null,
            shardCount: null,
            isPersonal: null,
            enableCooldowns: null
        },
        playerOptions: {
            defaultVolume: null,
            djRoleName: null,
            playlistLimit: null,
            enablePresets: null
        }
    };

    // Get keys
    config.keys.botToken = process.env.CONFIG_DISCORD_BOT_TOKEN;
    config.keys.youtubeAPI = process.env.CONFIG_YT_API_KEY;

    // Get bot options
    config.botOptions.owners = getOwners();
    config.botOptions.prefix = process.env.CONFIG_PREFIX;
    config.botOptions.shardCount = Math.floor(parseInt(process.env.CONFIG_SHARD_COUNT)) || 1;
    config.botOptions.isPersonal = getStatus(process.env.CONFIG_IS_PERSONAL) || false;
    config.botOptions.enableCooldowns = getStatus(process.env.CONFIG_ENABLE_COOLDOWNS) || true;

    // Get player options
    config.playerOptions.defaultVolume = Math.floor(parseInt(process.env.CONFIG_DEFAULT_VOLUME)) || 75;
    config.playerOptions.djRoleName = process.env.CONFIG_DJ_ROLE_NAME || 'DJ';
    config.playerOptions.playlistLimit = Math.floor(parseInt(process.env.CONFIG_PLAYLIST_LIMIT)) || 100;
    config.playerOptions.enablePresets = getStatus(process.env.CONFIG_ENABLE_PRESETS) || true;

    // Detect when playlists have no limit
    if (config.playerOptions.playlistLimit === 0) config.playerOptions.playlistLimit = 10000;

    return config;
}

/**
 * Tries to precess string into array of strings.
 * @returns {string[]}
 */
function getOwners(): string[] {
    const owners: string[] = [];
    let data: string | string[] = process.env.CONFIG_OWNERS.replace(/\s+/g, '');

    data = data.split(',');
    if (typeof data === 'string') {
        owners.push(data);
    } else {
        data.forEach((x) => owners.push(x));
    }

    return owners;
}

/**
 * Reads boolean status from string.
 * @param status string
 * @returns {boolean}
 */
function getStatus(status: string): boolean {
    if (['true', 'yes'].includes(status)) {
        return true;
    } else {
        return false;
    }
}
