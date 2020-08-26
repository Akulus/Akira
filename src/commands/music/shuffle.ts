import { Message } from 'eris';
import AkiraClient from '../../util/client.js';
import { queueTypes, songTypes } from '../../typings/player.js';

export function add(client: AkiraClient): void {
    client.registerCommand(
        'shuffle',
        (msg: Message) => {
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

            // Require at least 3 tracks in queue
            if (serverQueue.songs.length - 1 < 3) return msg.channel.createMessage('❗ You need at least 3 songs waiting in queue to use that command.');

            // Randomize Array with tracks
            const songs: Array<songTypes> = serverQueue.songs;
            let j: number;

            for (let i = songs.length - 1; i > 1; i--) {
                j = 1 + Math.floor(Math.random() * i)
                ;[songs[i], songs[j]] = [songs[j], songs[i]];
            }

            serverQueue.songs = songs;
            return msg.channel.createMessage(`🎵 **Shuffled** \`${serverQueue.songs.length}\` songs. Use \`queue\` command to see changes.`);
        },
        {
            aliases: ['sh', 'randomize', 'random'],
            argsRequired: false,
            description: 'Shuffles all songs in queue.',
            fullDescription: 'Shuffles all songs in current queue. It places every song on random position, so you get different result every time.'
        }
    );
}
