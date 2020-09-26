import { Message, MessageEmbed } from 'discord.js';
import AkiraClient from '../utils/client';
import { version, description } from '../../package.json';

export = {
    description: 'Shows some basic info about bot.',
    aliases: ['bot', 'about'],

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
            .addField('Author', client.users.cache.get('390394829789593601').tag || 'Razzels', true)
            .addField('Language', 'TypeScript', true)
            .addField('Version', `v${version}`, true)
            .addField('Memory usage', `${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100}MB`, true)
            .addField('Source code', '[Github](https://github.com/Znudzony/Akira)', true)
            .addField('Library', '[Discord.js](https://discord.js.org/#/)', true)
            .setTimestamp();

        return msg.channel.send(statsInfo);
    }
}
