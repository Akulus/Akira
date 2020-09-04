import { Message, MessageEmbed } from 'discord.js';
import AkiraClient from '../utils/client';

export = {
    description: 'Allows bot owners to communicate back to bug reporters.',
    syntax: '<member ID> <feedback message>',
    aliases: ['respond'],
    reqOwner: true,
    isHidden: true,

    /**
     * Main command function, generator.
     * @param {AkiraClient} [client]
     * @param {Message} [msg]
     * @param {string[]} [args]
     * @returns {Promise<Message>}
     */
    async execute(client: AkiraClient, msg: Message, args: string[]): Promise<Message> {
        if (!args[0]) return msg.channel.send('🔎 Please provide an ID of a member that you want to send message to.');
        else if (!args[1]) return msg.channel.send('🔎 Please provide also a message to send.');

        client.users
            .fetch(args[0], false, false)
            .then(async (member) => {
                const replyInfo = new MessageEmbed()
                    .setTitle('📯 You received a reply from bot owner')
                    .setThumbnail(msg.author.displayAvatarURL())
                    .setDescription(`**A:** ${args.join(' ').slice(args[0].length)}`)
                    .setFooter(`${msg.author.tag} respond to your message.`)
                    .setTimestamp();

                await member
                    .send(replyInfo)
                    .then(() => {
                        return msg.channel.send('✉️ Message has been send. 👍');
                    })
                    .catch((e) => {
                        return msg.channel.send(`⚠️ I could not send message to <@${member.id}>. Probably member disabled DM messages.`);
                    });
            })
            .catch((e) => {
                return msg.channel.send('⚠️ Provided id is invalid or that member does not have any connection with me anymore.');
            });
    }
}
