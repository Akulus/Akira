import { Message, EmbedOptions } from 'eris';
import AkiraClient from '../../util/client.js';
import { queueTypes } from '../../typings/player.js';

export function add(client: AkiraClient): void {
    client.registerCommand(
        'queue',
        (msg: Message, args: string[]) => {
            // Check if player plays anything & if member is on correct channel
            const serverQueue: queueTypes | undefined = client.player.getPlayer(msg.guildID);
            if (!serverQueue || !serverQueue.connection)
                return msg.channel.createMessage('❗ There is nothing playing right now so I can\'t process that command.');

            // Split queue into pages
            let page = 1;
            const pages: number = Math.ceil(serverQueue.songs.length / 10);

            if (args[0] && /^([0-9])+$/.test(args[0])) {
                page = Math.floor(Number(args[0]));
                if (page > pages) page = pages;
                if (page < 1) page = 1;
            } else {
                page = 1;
            }

            let inQueue = '';
            let min: number = (page - 1) * 10 + 1;
            const max: number = page * 10;

            while (min !== max + 1) {
                if (serverQueue.songs[min]) {
                    inQueue =
                        inQueue +
                        `**${min}.** [${serverQueue.songs[min].title}](${serverQueue.songs[min].url}) \`[${client.player.getReadableTimestamp(
                            serverQueue.songs[min].duration
                        )}]\`\n`;
                }
                min++;
            }

            let playingStatus = 'Playing';
            if (!serverQueue.isPlaying) playingStatus = 'Paused';

            const embedReply: EmbedOptions = {
                title: `Player queue for ${msg.member.guild.name}`,
                thumbnail: {
                    url: msg.member.guild.iconURL
                },
                description: `➥ ${playingStatus}\n[${serverQueue.songs[0].title}](${serverQueue.songs[0].url}) \`[${client.player.getReadableTimestamp(
                    serverQueue.songs[0].duration
                )}]\`\n\n➥ In queue\n─────────────────────────────────\n${inQueue}\n\nPage: ${page}/${pages} | ${
                    serverQueue.songs.length - 1
                } song(s) waiting in queue.`,
                footer: {
                    icon_url: msg.author.avatarURL,
                    text: `Invoked by ${msg.author.username}${msg.member.nick ? ` (aka ${msg.member.nick})` : ''}`
                }
            };

            return msg.channel.createMessage({ embed: embedReply });
        },
        {
            aliases: ['q', 'playing'],
            argsRequired: false,
            description: 'Displays list with tracks in queue.',
            fullDescription: 'Displays list with tracks in queue. Provide a number as argument to see different page.'
        }
    );
}
