import AkiraClient from '../../services/client';
import { Message, VoiceConnection } from 'discord.js';
import { queueTypes, songTypes } from '../../typings/player';

export = {
    description: 'Shows basic memory usage.',
    syntax: '<title or url link to song>',
    examples: ['https://www.youtube.com/watch?v=ALER0RPutl4', 'Nimi Dovrat - Many Times'],
    aliases: ['p', 'stream'],
    permissionLevel: 0,
    cooldown: 1.5,

    /**
     * Main, logic element of the command.
     * @param client {AkiraClient}
     * @param message {Message}
     * @param args {string[]}
     * @returns {Promise<void>}
     */
    async execute(client: AkiraClient, message: Message, args: string[]): Promise<Message> {
        // Check if member is on a voice channel & if provided any query
        if (!message.member.voice.channel) return message.channel.send('🔎 Where are you? I can\'t find right voice channel to join.');
        else if (!args[0]) return message.channel.send('🔎 I don\'t know what I should do. Please provide a title or url to song that you want to play.');

        // Check if bot have permission to join & stream music on member voice channel
        if (!message.guild.me.permissionsIn(message.member.voice.channel).has(['CONNECT', 'SPEAK']))
            return message.channel.send(
                `🔒 I cannot start playing music on \`${message.member.voice.channel.name}\` voice channel. Make sure I have permission to connect and speak.`
            );

        const query: string = args.join(' ').replace(/<(.+)>/g, '$1');
        let serverQueue: queueTypes | undefined = client.player.queue.get(message.guild.id);

        // Detect type of provided query (playlist / single url link / search)
        switch (client.player.validateQuery(query)) {
            case 2: {
                break;
            }
            case 1: {
                const data: songTypes | string = await client.player.getVideo(query, message.author.tag);

                // Check if there's no error
                if (typeof data === 'string') {
                    if (data.includes('Video unavailable')) return message.channel.send('⚠️ Provided url is invalid or song from it is currently unavailable.');
                    else if (data.includes('private video')) return message.channel.send('🔒 Video from provided url is private.');
                    else if (data.includes('copyright')) return message.channel.send('🔒 Video from provided url is under copyrights.');
                    else {
                        client.log(`${message.guild.name} => Run into problem when tried to handle song from url.\n${data}`, 'error');
                        return message.channel.send('⚠️ I run into unknown error. Contact the bot owner if this problem is common.');
                    }
                }

                if (serverQueue) {
                    serverQueue.songs.push(data);
                    return message.channel.send(`🎵 **Queued up:** ${data.title} \`${client.player.getReadableTimestamp(data)}\``);
                } else {
                    try {
                        serverQueue = client.player.createQueue(message.guild.id, message.guild.name, message.member.voice.channel);
                        serverQueue.songs.push(data);
                        serverQueue.connection = await message.member.voice.channel.join();
                        serverQueue.connection.voice.setSelfDeaf(true);
                        client.player.play(serverQueue);
                        return message.channel.send(`🎵 **Playing:** ${data.title} \`${client.player.getReadableTimestamp(data)}\``);
                    } catch (err) {
                        client.log(`${message.guild.name} => Run into problem when tried to initialize new queue & start play function.\n${err}`, 'error');
                        return message.channel.send('⚠️ I run into unknown error. Contact the bot owner if this problem is common.');
                    }
                }
            }
            case 0: {
                break;
            }
        }
    }
}
