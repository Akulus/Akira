import { Message, MessageEmbed } from 'discord.js';
import AkiraClient from '../utils/client';

export = {
    description: 'Sends feedback back to bot owner(s). Use it to inform about bugs or ideas.',
    syntax: '<your message>',
    aliases: ['rep'],

    /**
     * Main command function, generator.
     * @param {AkiraClient} [client]
     * @param {Message} [msg]
     * @param {string[]} [args]
     * @returns {Promise<Message>}
     */
    async execute(client: AkiraClient, msg: Message, args: string[]): Promise<Message> {
        if (!args[0]) return msg.channel.send('🔎 Nothing to send. Please describe as best as you can your idea or found bug.');
        else if (args.join(' ').length > 2048) return msg.channel.send('⚠️ Your message is too big. Try to precise description to get it length under **2048 characters**.');

        const reportInfo = new MessageEmbed()
            .setTitle('📰 New report/proposition')
            .setDescription(`\`\`\`${args.join(' ')}\`\`\``)
            .setThumbnail(msg.author.displayAvatarURL())
            .addField('✩ Sended from guild', `${msg.guild.name}\n\`(${msg.guild.id})\``, true)
            .addField('✩ Sended by', `${msg.author.tag}\n\`(${msg.author.id})\``, true)
            .setFooter(`\nWant to respond? Use command:\nreply ${msg.author.id} <feedback message>\n\nReceived `)
            .setTimestamp();

        client.commandManager.owners.forEach((ownerID) => {
            client.users.fetch(ownerID, true, false).then(async (owner) => {
                try {
                    await owner.send(reportInfo);
                } catch (e) {
                    client.log(
                        `Bot owner - ${owner.tag} (${ownerID}) seems to have disabled DM messages from bot or does not have any way of connection. I can't show you new report message because of that.`,
                        1
                    );
                }
            });
        });

        return msg.channel.send('✉️ Message has been send. One of my masters should read it soon. Do you need fast help? Open new issue here: <https://github.com/Znudzony/Akira/issues>');
    }
}
