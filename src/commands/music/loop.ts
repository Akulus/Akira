import { Message } from 'eris';
import AkiraClient from '../../util/client.js';
import { queueTypes } from '../../typings/player.js';

export function add(client: AkiraClient): void {
    client.registerCommand(
        'loop',
        (msg: Message, args: string[]) => {
            // Check if player plays anything & if member is on correct channel
            const serverQueue: queueTypes | undefined = client.player.getPlayer(msg.guildID);
            if (!serverQueue || !serverQueue.connection)
                return msg.channel.createMessage('❗ There is nothing playing right now so I can\'t process that command.');
            else if (serverQueue && serverQueue.connection.channelID !== msg.member.voiceState.channelID)
                return msg.channel.createMessage('❗ You need to be in the same voice channel as I to use this command.');

            // Check if member have a DJ role, if yes - skip voting system
            if (!client.player.canBypassVoting(msg)) {
                return msg.channel.createMessage(
                    '❗ You do not have enough permission to use this command.\nOnly members with DJ role or server administrators can use it.'
                );
            }

            if (serverQueue.loopMode === 0) {
                if (!args[0] || (args[0] && ['song', 'track', 'current', 'playing', 'currently'].includes(args[0].toLowerCase()))) {
                    serverQueue.loopMode = 2;
                    return msg.channel.createMessage(`🎵 Enabled **loop** mode. \`${serverQueue.songs[0].title}\` will be played over and over.`);
                } else if (args[0] && ['queue', 'all'].includes(args[0].toLowerCase())) {
                    serverQueue.loopMode = 1;
                    return msg.channel.createMessage(`🎵 Enabled **loop** mode. \`${serverQueue.songs.length}\` tracks will be played infinitely.`);
                }
            } else {
                serverQueue.loopMode = 0;
                return msg.channel.createMessage('🎵 Loop chain has been broken. Queue backs to normal.');
            }
        },
        {
            aliases: ['infinite', 'infinity'],
            argsRequired: false,
            description: 'Plays selected fragment infinitely.',
            fullDescription: 'Allows you to play current song in loop. You can add `all` parameter to give that effect over whole queue.'
        }
    );
}
