import { Message, MessageEmbed } from 'discord.js';
import AkiraClient from '../utils/client';

export = {
    description: 'Allows you to invite bot to another server.',
    aliases: ['inv'],

    /**
     * Main command function, generator.
     * @param {AkiraClient} [client]
     * @param {Message} [msg]
     * @returns {Promise<Message>}
     */
    async execute(client: AkiraClient, msg: Message): Promise<Message> {
        if (client.clientID === 'Unknown') return msg.channel.send('⛔ Sorry, but this command is disabled.');

        const inviteInfo = new MessageEmbed()
            .setFooter(`Invoked by ${msg.author.username}${msg.member.displayName !== msg.author.username ? ` (aka ${msg.member.displayName})` : ''}`, msg.author.displayAvatarURL())
            .setTitle('🔗 Select type of invite')
            .setDescription(
                `[Regular (with all needed permissions)](https://discord.com/oauth2/authorize?client_id=${client.clientID}&scope=bot&permissions=3165184)\n[Clear (empty, not recommended)](https://discord.com/oauth2/authorize?client_id=${client.clientID}&scope=bot&permissions=0)`
            );

        return msg.channel.send(inviteInfo);
    }
}
