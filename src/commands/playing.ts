import { Message, MessageEmbed } from 'discord.js';
import AkiraClient from '../utils/client';
import trackTypes from '../typings/track';

export = {
    description: 'Shows currently playing track title & author.',
    aliases: ['np', 'nowplaying', 'streaming'],

    /**
     * Main command function, generator.
     * @param {AkiraClient} [client]
     * @param {Message} [msg]
     * @returns {Promise<Message>}
     */
    async execute(client: AkiraClient, msg: Message): Promise<Message> {
        const currentTrack: trackTypes = client.radioManager.getStreamDetails();

        const trackInfo = new MessageEmbed()
            .setTitle('📡 Currently transmitted')
            .addField('✩ Title', `\`\`\`${currentTrack.title}\`\`\``, true)
            .addField('✩ Author(s)', `\`\`\`${client.radioManager.parseAuthors(currentTrack.author)}\`\`\``, true)
            .setFooter(`Invoked by ${msg.author.username}${msg.member.displayName !== msg.author.username ? ` (aka ${msg.member.displayName})` : ''}`, msg.author.displayAvatarURL())
            .setTimestamp();

        return msg.channel.send(trackInfo);
    }
}
