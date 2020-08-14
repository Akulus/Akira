"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Run basic check for message conditions.
 * @param client {AkiraClient}
 * @param message {Message}
 * @returns {Promise<void>}
 */
async function validateMessage(client, message) {
    // Gate 1 - Basic check if bot is a human & if this is a guild channel
    if (message.author.bot || !message.guild)
        return;
    // Gate 2 - Check if bot is restricted to owners only (personal)
    if (client.config.botOptions.isPersonal && !client.config.botOptions.owners.includes(message.author.id))
        return;
    // Gate 3 - Check if bot have permissions to even respond
    if (!message.guild.me.permissionsIn(message.channel).has('SEND_MESSAGES'))
        return;
    // Gate 4 - Search for prefix (normal or mention)
    const prefix = getPrefix(client.user.id, message.content, client.config.botOptions.prefix);
    if (!prefix)
        return;
    // Gate 5 - Split message into elements + search if that command exist
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    const command = client.commands.find((c) => c.name === cmd || (c.aliases && c.aliases.includes(cmd)));
    if (!command)
        return;
    // Gate 6 - Chceck if that member have permission to execute this command
    if (!validatePermissions(message, command.permissionLevel, client.config.playerOptions.djRoleName, client.config.botOptions.owners))
        return;
    // Gate 7 - Cooldowns (Run only if enabled in config)
    // #TODO
    // Gate 8 - THE END, try to execute command
    try {
        command.execute(client, message, args);
    }
    catch (error) {
        client.log(error, 'error');
    }
}
exports.default = validateMessage;
/**
 * Use this function to find prefix in msg content.
 * @param clientID {string}
 * @param content {string}
 * @returns {string | undefined}
 */
function getPrefix(clientID, content, prefix) {
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefixRegex = new RegExp(`^(<@!?${clientID}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(content))
        return undefined;
    const [, matchedPrefix] = content.match(prefixRegex);
    if (content.length === matchedPrefix.length)
        return undefined;
    return matchedPrefix;
}
/**
 * Check if member that send message have enough permission to use this command.
 * @param message {Message}
 * @param reqLevel {number}
 * @returns {boolean}
 */
function validatePermissions(message, reqLevel, djRoleName, ownerList) {
    const djRole = message.guild.roles.cache.find((role) => role.name === djRoleName);
    let memberLevel = 0;
    // Calculate perms for DJ
    if (djRole && message.member.roles.cache.has(djRole.id))
        memberLevel = 1;
    // Calculate perms for Admin
    if (message.member.hasPermission('ADMINISTRATOR') || message.member.hasPermission('MANAGE_GUILD') || message.member.id === message.guild.ownerID)
        memberLevel = 2;
    // Calculate perms for bot Owner
    if (ownerList.includes(message.author.id))
        memberLevel = 3;
    // Compare permission levels
    if (memberLevel >= reqLevel)
        return true;
    else
        return false;
}
