import { Message, VoiceChannel } from 'eris';
import AkiraClient from '../../util/client.js';
import { queueTypes } from '../../typings/player.js';

export function add(client: AkiraClient): void {
    client.registerCommand(
        'skip',
        (msg: Message) => {
            // Check if player plays anything
            const serverQueue: queueTypes | undefined = client.player.getPlayer(msg.guildID);
            if (!serverQueue || !serverQueue.connection) return msg.channel.createMessage('❗ There is nothing playing that I could skip for you.');
            else if (serverQueue && serverQueue.connection.channelID !== msg.member.voiceState.channelID)
                return msg.channel.createMessage('❗ You need to be in the same voice channel as I to use this command.');

            // Check if member have a DJ role, if yes - skip voting system
            if (client.player.canBypassVoting(msg)) {
                serverQueue.isPlaying = true;

                if (serverQueue.songs[1]) {
                    msg.channel.createMessage(
                        `🎵 **Skipped to:** ${serverQueue.songs[1].title} \`[${client.player.getReadableTimestamp(serverQueue.songs[1].duration)}]\``
                    );
                } else {
                    msg.channel.createMessage('👋 **Skipped** the last playing song. Bye.');
                }

                if (serverQueue.loopMode === 2) serverQueue.songs.shift();
                serverQueue.connection.stopPlaying();
                return;
            } else {
                // @ts-ignore
                const voiceChannel: VoiceChannel = msg.member.guild.channels.get(serverQueue.connection.channelID);
                const required: number = Math.ceil(voiceChannel.voiceMembers.size / 2); // -1 because, we do not want to count bot

                if (!serverQueue.songs[0].votesToSkip) serverQueue.songs[0].votesToSkip = [];

                // Check if member already voted
                if (serverQueue.songs[0].votesToSkip.includes(msg.author.id))
                    return msg.channel.createMessage(
                        `📋 You already voted to **skip** current song. ┇ ${client.player.getVotingProgressBar(
                            serverQueue.songs[0].votesToSkip.length,
                            required
                        )}`
                    );

                // Add +1 to votes if that was first time
                serverQueue.songs[0].votesToSkip.push(msg.author.id);

                if (serverQueue.songs[0].votesToSkip.length >= required) {
                    serverQueue.isPlaying = true;

                    if (serverQueue.songs[1]) {
                        msg.channel.createMessage(
                            `🎵 **Skipped to:** ${serverQueue.songs[1].title} \`[${client.player.getReadableTimestamp(serverQueue.songs[1].duration)}]\``
                        );
                    } else {
                        msg.channel.createMessage('👋 **Skipped** the last playing song. Bye.');
                    }

                    if (serverQueue.loopMode === 2) serverQueue.songs.shift();
                    serverQueue.connection.stopPlaying();
                    return;
                } else {
                    return msg.channel.createMessage(
                        `📋 **Voted** to skip the current song. ┇ ${client.player.getVotingProgressBar(serverQueue.songs[0].votesToSkip.length, required)}`
                    );
                }
            }
        },
        {
            aliases: ['next'],
            argsRequired: false,
            description: 'Skip the currently playing song.',
            fullDescription: 'Allows you to skip current song. Members with DJ role can bypass voting system.'
        }
    );
}
