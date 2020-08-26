import { Message } from 'eris';
import AkiraClient from '../../util/client.js';
import { queueTypes } from '../../typings/player.js';

export function add(client: AkiraClient): void {
    client.registerCommand(
        'pause',
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

            if (serverQueue.isPlaying) {
                serverQueue.isPlaying = false;
                serverQueue.connection.pause();
                serverQueue.connection.updateVoiceState(true, true);
                serverQueue.waitTimer = setTimeout(
                    () => client.player.deconstructPlayer(serverQueue),
                    client.config.musicSettings.timeAfterBotShouldLeave * 1000
                );
                return msg.channel.createMessage('🎵 **Paused** music player. Use `resume` command to back music.');
            } else {
                return msg.channel.createMessage('❗ Music player is already **paused**. Use `resume` command to back music.');
            }
        },
        {
            aliases: ['wait', 'await'],
            argsRequired: false,
            description: 'Pauses music.',
            fullDescription: 'Pauses music. Bot will wait set amount of time, and then leave from channel if you will not resume music.'
        }
    );
}
