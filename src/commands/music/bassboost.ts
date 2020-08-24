import { Message } from 'eris';
import AkiraClient from '../../util/client.js';
import { queueTypes } from '../../typings/player.js';

export function add(client: AkiraClient): void {
    client.registerCommand(
        'bassboost',
        (msg: Message) => {
            // Check if player plays anything & if member is on correct channel
            const serverQueue: queueTypes | undefined = client.player.getPlayer(msg.guildID);
            if (!serverQueue || !serverQueue.connection) return msg.channel.createMessage('❗ There is nothing playing that I could skip for you.');
            else if (serverQueue && serverQueue.connection.channelID !== msg.member.voiceState.channelID)
                return msg.channel.createMessage('❗ You need to be in the same voice channel as I to use this command.');

            // Check if member have a DJ role, if yes - skip voting system
            if (!client.player.canBypassVoting(msg)) {
                return msg.channel.createMessage(
                    '❗ You do not have enough permission to use this command.\nOnly members with DJ role or server administrators can use it.'
                );
            }

            if (serverQueue.isBassBoosted) {
                serverQueue.isBassBoosted = false;
                return msg.channel.createMessage('🎵 **Disabled** bass boost mode. *(changes will be applied from new song)*');
            } else {
                serverQueue.isBassBoosted = true;
                return msg.channel.createMessage('🎵 **Enabled** bass boost mode. *(changes will be applied from new song)*');
            }
        },
        {
            aliases: ['bb', 'bass'],
            argsRequired: false,
            description: 'Modifies equalizer to get stronger bass.',
            fullDescription: 'Modifies main music stream by increasing bass strength.'
        }
    );
}
