"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateMessage(client, message) {
    // Gate 1 - Basic check if bot is a human & if this is a guild channel
    if (message.author.bot || !message.guildID)
        return;
    //test <===================================================
    if (!validatePermissions(message, 0, client.config.playerOptions.djRoleName, client.config.botOptions.owners))
        return;
    // Gate 2 - Check if bot is restricted to owners only (personal)
    if (client.config.botOptions.isPersonal && !client.config.botOptions.owners.includes(message.author.id))
        return;
    // Gate 3 - Check if bot have permissions to even respond
    // @ts-ignore <== @types/Eris are omega old and have missing a lot :/
    if (!message.channel.permissionsOf(client.user.id).has('sendMessages'))
        return;
    // Gate 4 - Search for prefix (normal or mention)
    const prefix = getPrefix(client.user.id, message.content, client.config.botOptions.prefix);
    if (!prefix)
        return;
    // Gate 5 - Split message into elements + search if that command exist
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
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
    const djRole = message.member.guild.roles.find((role) => role.name === djRoleName);
    let memberLevel = 0;
    // Calculate perms for DJ's
    if (djRole && message.member.roles.includes(djRole.id))
        memberLevel = 1;
    // Calculate perms for Administators
    if (message.member.permission.has('administrator'))
        memberLevel = 2;
    else if (message.member.permission.has('manageGuild'))
        memberLevel = 2;
    else if (message.author.id === message.member.guild.ownerID)
        memberLevel = 2;
    // Calculate perms for bot Owners
    if (ownerList.includes(message.author.id))
        memberLevel = 3;
    // TEST <==========================================================================
    console.log(`Member: ${message.author.username}  |  Permission level: ${memberLevel}`);
    // Compare permission levels
    if (memberLevel >= reqLevel)
        return true;
    else
        return false;
}
