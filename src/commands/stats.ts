import { Message, MessageEmbed, Collection, Guild } from 'discord.js';
import AkiraClient from '../utils/client';
import { version, description } from '../../package.json';

export = {
    description: 'Shows some basic info about bot & radio.',
    aliases: ['statistics', 'usage', 'info'],

    /**
     * Main command function, generator.
     * @param {AkiraClient} [client]
     * @param {Message} [msg]
     * @returns {Promise<Message>}
     */
    async execute(client: AkiraClient, msg: Message): Promise<Message> {
        const statsInfo = new MessageEmbed()
            .setFooter(`Invoked by ${msg.author.username}${msg.member.displayName !== msg.author.username ? ` (aka ${msg.member.displayName})` : ''}`, msg.author.displayAvatarURL())
            .setTitle('👋 Information')
            .setDescription(`➥ ${description}`)
            .addField('Uptime', parseUptimeData(client.uptime), true)
            .addField('Memory usage', `${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100}MB`, true)
            .addField('General stats', `✩ Guilds: \`${client.guilds.cache.size}\`\n✩ Members: \`${getMemberCount(client.guilds.cache)}\`\n✩ Channels: \`${client.channels.cache.size}\``, true)
            .addField('Version', `v${version}`, true)
            .addField('Source code', '[Github](https://github.com/Razzels0/Akira)', true)
            .addField('Library', '[Discord.js](https://discord.js.org/#/)', true)
            .addField('Language', 'TypeScript', true)
            .setTimestamp();

        return msg.channel.send(statsInfo);
    }
}

/**
 * Return readable uptime string.
 * @param {number} [time]
 * @returns {string}
 */
function parseUptimeData(time: number): string {
    const days = Math.floor(time / 86400000);
    const hours = Math.floor(time / 3600000) % 24;
    const minutes = Math.floor(time / 60000) % 60;
    const seconds = Math.floor(time / 1000) % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Return total number of users from all guilds.
 * @param {Collection<string, Guild>} [guildCache]
 * @returns {number}
 */
function getMemberCount(guildCache: Collection<string, Guild>): number {
    let totalMembers = 0;
    guildCache.forEach((guild) => (totalMembers = totalMembers + guild.memberCount));
    return totalMembers;
}
