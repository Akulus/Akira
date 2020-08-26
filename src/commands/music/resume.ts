import { Message } from 'eris';
import AkiraClient from '../../util/client.js';
import { queueTypes } from '../../typings/player.js';

export function add(client: AkiraClient): void {
    client.registerCommand(
        'resume',
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

            if (!serverQueue.isPlaying) {
                serverQueue.isPlaying = true;
                serverQueue.connection.updateVoiceState(false, true);
                serverQueue.connection.resume();
                clearTimeout(serverQueue.waitTimer);
                if (serverQueue.waitTimer) delete serverQueue.waitTimer;
                return msg.channel.createMessage(
                    `🎵 **Playing:** ${serverQueue.songs[0].title} \`[${client.player.getReadableTimestamp(serverQueue.songs[0].duration)}]\``
                );
            } else {
                return msg.channel.createMessage('❗ I\'m already playing music. Use `pause` command to stop player.');
            }
        },
        {
            aliases: ['res'],
            argsRequired: false,
            description: 'Resumes music.',
            fullDescription: 'Resumes music from the same moment that was paused before.'
        }
    );
}
