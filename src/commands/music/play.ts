import { Message } from 'eris';
import AkiraClient from '../../util/client.js';
import { queueTypes, songTypes } from '../../typings/player.js';

export function add(client: AkiraClient): void {
    client.registerCommand(
        'play',
        async (msg: Message, args: string[]) => {
            // Check if member is on voice channel
            if (!msg.member.voiceState || !msg.member.voiceState.channelID)
                return msg.channel.createMessage('🔎 Where are you? I can\'t find right voice channel to join.');

            // Check if bot have enough permissions
            if (!msg.member.guild.channels.get(msg.member.voiceState.channelID).permissionsOf(client.user.id).has('voiceConnect'))
                return msg.channel.createMessage('🔒 I cannot connect to this voice channel.');
            else if (!msg.member.guild.channels.get(msg.member.voiceState.channelID).permissionsOf(client.user.id).has('voiceSpeak'))
                return msg.channel.createMessage('🔒 I cannot speak on this voice channel.');

            const query: string = args.join(' ').replace(/<(.+)>/g, '$1');
            let serverQueue: queueTypes | undefined = client.player.getPlayer(msg.guildID);

            // Check if member is on correct channel
            if (serverQueue && serverQueue.connection.channelID !== msg.member.voiceState.channelID)
                return msg.channel.createMessage('❗ You need to be in the same voice channel as I to use this command.');

            // Detect if provided args are link or song title (or playlist)
            switch (client.player.validateQuery(query)) {
                case 2: {
                    break; // TODO, playlists
                }
                case 1: {
                    const handleTrack: songTypes | string = await client.player.getVideo(query, msg.author.username);

                    // Return with a message about an error if function .getVideo return a string
                    if (typeof handleTrack === 'string') return msg.channel.createMessage(handleTrack);

                    // Try to handle song object to the queue
                    if (serverQueue) {
                        serverQueue.songs.push(handleTrack);
                        return msg.channel.createMessage(
                            `🎵 **Queued up:** ${handleTrack.title} \`[${client.player.getReadableTimestamp(handleTrack.duration)}]\``
                        );
                    } else {
                        serverQueue = client.player.constructNewQueue(msg);
                        serverQueue.songs.push(handleTrack);
                        serverQueue.connection = await client.joinVoiceChannel(msg.member.voiceState.channelID);
                        serverQueue.connection.updateVoiceState(false, true);
                        client.player.play(serverQueue);
                        return msg.channel.createMessage(
                            `🎵 **Playing:** ${handleTrack.title} \`[${client.player.getReadableTimestamp(handleTrack.duration)}]\``
                        );
                    }
                }
                case 0: {
                    const handleTrack: songTypes | string = await client.player.searchVideo(query, msg.author.username);

                    // Return with a message about an error if function .getVideo return a string
                    if (typeof handleTrack === 'string') return msg.channel.createMessage(handleTrack);

                    // Try to handle song object to the queue
                    if (serverQueue) {
                        serverQueue.songs.push(handleTrack);
                        return msg.channel.createMessage(
                            `🎵 **Queued up:** ${handleTrack.title} \`[${client.player.getReadableTimestamp(handleTrack.duration)}]\``
                        );
                    } else {
                        serverQueue = client.player.constructNewQueue(msg);
                        serverQueue.songs.push(handleTrack);
                        serverQueue.connection = await client.joinVoiceChannel(msg.member.voiceState.channelID);
                        serverQueue.connection.updateVoiceState(false, true);
                        client.player.play(serverQueue);
                        return msg.channel.createMessage(
                            `🎵 **Playing:** ${handleTrack.title} \`[${client.player.getReadableTimestamp(handleTrack.duration)}]\``
                        );
                    }
                }
            }
        },
        {
            aliases: ['p', 'stream', 'sing'],
            argsRequired: true,
            description: 'Plays audio from YouTube.',
            fullDescription: 'Allows you to play music from YouTube on you voice channel.\n*(Live support is disabled to increase quality)*',
            invalidUsageMessage: '🔎 Missing arguments. Provide a title or url link to song.\nFor example: `play Coopex - Heartless`',
            usage: '<title or url to song>'
        }
    );
}
