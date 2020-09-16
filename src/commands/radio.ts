import { Message, MessageEmbed, VoiceChannel } from 'discord.js';
import guildDataTypes from '../typings/database';
import { trackTypes } from '../typings/playlist';
import AkiraClient from '../utils/client';

export = {
    description: 'Shows currently playing track title & author.',
    aliases: ['stream', 'streaming'],

    /**
     * Main command function, generator.
     * @param {AkiraClient} [client]
     * @param {Message} [msg]
     * @returns {Promise<Message>}
     */
    async execute(client: AkiraClient, msg: Message): Promise<Message> {
        const currentTrack: trackTypes = client.radioManager.getStreamDetails();
        const guildData: guildDataTypes = await client.commandManager.getInfoFromDatabase(msg);

        const voiceChannel: VoiceChannel = msg.guild.channels.cache.get(guildData.voiceChannelID) as VoiceChannel;

        const radioInfo = new MessageEmbed()
            .setFooter(`Invoked by ${msg.author.username}${msg.member.displayName !== msg.author.username ? ` (aka ${msg.member.displayName})` : ''}`, msg.author.displayAvatarURL())
            .setTimestamp()
            .addField('📡 Radio Data', `${await client.radioManager.getBroadcastDetails()}\nUptime: \`${parseUptimeData(client.uptime)}\``, true)
            .addField('🎧 Stream Info', `Song: \`${currentTrack.title ? currentTrack.title : 'Unknown'}\`\nAuthor(s):\n\`${client.radioManager.parseAuthors(currentTrack.author)}\``, true);

        if (!voiceChannel || !guildData.voiceChannelID) radioInfo.setDescription('This server does not configured radio yet! Use `config` command to change it.');
        else
            radioInfo.addField(
                '🌎 Connection Info',
                `Localization: \`${msg.guild.preferredLocale}\`\nAvg. Latency: \`${Math.floor(client.ws.ping)}ms\`\nMax bitrate: \`${voiceChannel.bitrate / 1000}kbps\`\nBound to: \`${
                    voiceChannel.name
                }\``,
                true
            );

        return msg.channel.send(radioInfo);
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
