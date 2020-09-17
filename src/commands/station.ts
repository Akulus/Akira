import { Message, MessageEmbed } from 'discord.js';
import AkiraClient from '../utils/client';

export = {
    description: 'Allows bot owners to switch music plan on live.',
    syntax: '[playlist TAG or title]',
    reqOwner: true,

    /**
     * Main command function, generator.
     * @param {AkiraClient} [client]
     * @param {Message} [msg]
     * @param {string[]} [args]
     * @returns {Promise<Message>}
     */
    async execute(client: AkiraClient, msg: Message, args: string[]): Promise<Message> {
        if (!args[0]) {
            const availablePlaylists = new MessageEmbed()
                .setTitle('List of all working stations')
                .setFooter(`Invoked by ${msg.author.username}${msg.member.displayName !== msg.author.username ? ` (aka ${msg.member.displayName})` : ''}`, msg.author.displayAvatarURL());
            client.radioManager.playlists.forEach((station) =>
                availablePlaylists.addField(`[${station.tag.toUpperCase()}] ${station.title}`, `Created by: \`${station.author}\`\nTracks: \`${station.songs.length}\``, false)
            );

            return msg.channel.send(availablePlaylists);
        }

        if (client.radioManager.changePlaylistToStream(args.join(' ')) === 0)
            return msg.channel.send(`📡 Modified transmittion. **Streaming:** \`[${client.radioManager.playlist.tag.toUpperCase()}] ${client.radioManager.playlist.title}\``);
        else return msg.channel.send('⚠️ I could not find any working playlist registered under provided TAG or title.');
    }
}
