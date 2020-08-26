import { Message } from 'eris';
import AkiraClient from '../../util/client.js';
import { queueTypes } from '../../typings/player.js';

export function add(client: AkiraClient): void {
    client.registerCommand(
        'volume',
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

            // Show info about current volume level if member not provided new value
            if (!args[0]) return msg.channel.createMessage(`🎵 I am currently playing music at \`${serverQueue.volume}%\` volume.`);

            if (/^[0-9]+$/.test(args[0])) {
                if (Number(args[0]) > 100) serverQueue.volume = 100;
                else if (Number(args[0]) < 1) serverQueue.volume = 1;

                const oldVol: number = serverQueue.volume;

                serverQueue.volume = Math.ceil(Number(args[0]));
                serverQueue.connection.setVolume(serverQueue.volume / 100);
                return msg.channel.createMessage(`🎵 Modified **volume** from \`${oldVol}%\` to \`${serverQueue.volume}%\``);
            } else {
                return msg.channel.createMessage('❗ Provided argument is invalid. Select number in range 1-100.');
            }
        },
        {
            aliases: ['vol', 'v'],
            argsRequired: false,
            description: 'Modifies volume level.',
            fullDescription: '"Changes volume level of currently playing music.',
            usage: '[new value from range from 1 to 100]'
        }
    );
}
