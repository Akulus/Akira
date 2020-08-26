import { Message, VoiceChannel } from 'eris';
import AkiraClient from '../../util/client.js';
import { queueTypes } from '../../typings/player.js';

export function add(client: AkiraClient): void {
    client.registerCommand(
        'stop',
        (msg: Message) => {
            // Check if player plays anything & if member is on correct channel
            const serverQueue: queueTypes | undefined = client.player.getPlayer(msg.guildID);
            if (!serverQueue || !serverQueue.connection)
                return msg.channel.createMessage('❗ There is nothing playing right now so I can\'t process that command.');
            else if (serverQueue && serverQueue.connection.channelID !== msg.member.voiceState.channelID)
                return msg.channel.createMessage('❗ You need to be in the same voice channel as I to use this command.');

            // Check if member have a DJ role, if yes - skip voting system
            if (client.player.canBypassVoting(msg)) {
                serverQueue.songs = [];
                serverQueue.connection.stopPlaying();
                return msg.channel.createMessage('👋');
            } else {
                // @ts-ignore
                const voiceChannel: VoiceChannel = msg.member.guild.channels.get(serverQueue.connection.channelID);
                const required: number = Math.ceil(voiceChannel.voiceMembers.size / 2); // -1 because, we do not want to count bot

                if (!serverQueue.songs[0].votesToEnd) serverQueue.songs[0].votesToEnd = [];

                // Check if member already voted
                if (serverQueue.songs[0].votesToEnd.includes(msg.author.id))
                    return msg.channel.createMessage(
                        `📋 You already voted to **stop** music player. ┇ ${client.player.getVotingProgressBar(
                            serverQueue.songs[0].votesToSkip.length,
                            required
                        )}`
                    );

                // Add +1 to votes if that was first time
                serverQueue.songs[0].votesToEnd.push(msg.author.id);

                if (serverQueue.songs[0].votesToEnd.length >= required) {
                    serverQueue.songs = [];
                    serverQueue.connection.stopPlaying();
                    return msg.channel.createMessage('👋');
                } else {
                    return msg.channel.createMessage(
                        `📋 **Voted** to stop the music player. ┇ ${client.player.getVotingProgressBar(serverQueue.songs[0].votesToSkip.length, required)}`
                    );
                }
            }
        },
        {
            aliases: ['dc', 'end', 'disconnect', 'leave', 'exit'],
            argsRequired: false,
            description: 'Stops the music player.',
            fullDescription: 'Stops the music player & makes bot leave from the voice channel. Members with DJ role can bypass voting system.'
        }
    );
}
