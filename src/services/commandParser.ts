import AkiraClient from './client';
import { Message, Role } from 'eris';
import commandTypes from '../typings/command';

export default function validateMessage(client: AkiraClient, message: Message): void {
    // Gate 1 - Basic check if bot is a human & if this is a guild channel
    if (message.author.bot || !message.guildID) return;

    // Gate 2 - Check if bot is restricted to owners only (personal)
    if (client.config.botOptions.isPersonal && !client.config.botOptions.owners.includes(message.author.id)) return;

    // Gate 3 - Check if bot have permissions to even respond
    // @ts-ignore <== @types/Eris are omega old and have missing a lot :/
    if (!message.channel.permissionsOf(client.user.id).has('sendMessages')) return;

    // Gate 4 - Search for prefix (normal or mention)
    const prefix: string | undefined = getPrefix(client.user.id, message.content, client.config.botOptions.prefix);
    if (!prefix) return;

    // Gate 5 - Split message into elements + search if that command exist
    const args: string[] = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd: string = args.shift().toLowerCase();
    const command: commandTypes | undefined = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    if (!command) return;

    // Gate 6 - Chceck if that member have permission to execute this command
    if (!validatePermissions(message, command.permissionLevel, client.config.playerOptions.djRoleName, client.config.botOptions.owners)) return;

    // Gate 7 - Cooldowns (Run only if enabled in config)
    // #TODO

    // Gate 8 - THE END, try to execute command
    try {
        command.execute(client, message, args);
    } catch (error) {
        client.log(error, 'error');
    }
}

/**
 * Use this function to find prefix in msg content.
 * @param clientID {string}
 * @param content {string}
 * @returns {string | undefined}
 */
function getPrefix(clientID: string, content: string, prefix: string) {
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefixRegex = new RegExp(`^(<@!?${clientID}>|${escapeRegex(prefix)})\\s*`);

    if (!prefixRegex.test(content)) return undefined;
    const [, matchedPrefix] = content.match(prefixRegex);
    if (content.length === matchedPrefix.length) return undefined;

    return matchedPrefix;
}

/**
 * Check if member that send message have enough permission to use this command.
 * @param message {Message}
 * @param reqLevel {number}
 * @returns {boolean}
 */
function validatePermissions(message: Message, reqLevel: number, djRoleName: string, ownerList: string[]): boolean {
    const djRole: Role | undefined = message.member.guild.roles.find((role) => role.name === djRoleName);
    let memberLevel = 0;

    // Calculate perms for DJ's
    if (djRole && message.member.roles.includes(djRole.id)) memberLevel = 1;

    // Calculate perms for Administators
    if (message.member.permission.has('administrator')) memberLevel = 2;
    else if (message.member.permission.has('manageGuild')) memberLevel = 2;
    else if (message.author.id === message.member.guild.ownerID) memberLevel = 2;

    // Calculate perms for bot Owners
    if (ownerList.includes(message.author.id)) memberLevel = 3;

    // Compare permission levels
    if (memberLevel >= reqLevel) return true;
    else return false;
}
