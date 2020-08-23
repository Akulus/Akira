import AkiraClient from './client.js';
// @ts-ignore <== Missing @types
import Youtube from 'simple-youtube-api';
import { queueTypes, songTypes, durationTypes } from '../typings/player';
import ytdl from 'ytdl-core';
import { Message, VoiceConnection } from 'eris';

export default class Player {
    constructor(client: AkiraClient, ytKey: string) {
        this.client = client;
        this.youtube = new Youtube(ytKey);
        this.queue = new Map();
    }

    private readonly client: AkiraClient
    private youtube: Youtube
    private readonly queue: Map<string, queueTypes>

    /**
     * Main function that controls music dispatcher.
     * @param {queueTypes} [serverQueue]
     * @returns {Promise<void>}
     */
    async play(serverQueue: queueTypes): Promise<void> {
        if (!serverQueue || (serverQueue && serverQueue.songs.length === 0)) {
            try {
                serverQueue.connection.removeAllListeners();
                this.client.leaveVoiceChannel(serverQueue.connection.channelID);
                delete serverQueue.connection;
                this.queue.delete(serverQueue.guildID);
            } catch (error) {
                console.error(error);
            }
        }

        serverQueue.connection.setVolume(Number(serverQueue.volume) / 100);

        serverQueue.connection.play(ytdl(serverQueue.songs[0].url, { highWaterMark: 1 << 12, filter: 'audioonly', quality: 'highestaudio' }), {
            voiceDataTimeout: 4000,
            inlineVolume: false
        });

        serverQueue.connection.on('end', () => {
            // loopMode: 0 = disabled, 1 = for all tracks & 2 = only for current, single song
            if (serverQueue.loopMode === 1) serverQueue.songs.push(serverQueue.songs[0]);
            if (serverQueue.loopMode < 2) serverQueue.songs.shift();

            if (!serverQueue.songs[0]) {
                try {
                    serverQueue.connection.removeAllListeners();
                    this.client.leaveVoiceChannel(serverQueue.connection.channelID);
                    delete serverQueue.connection;
                } catch (err) {
                    console.error(`${serverQueue.guildName} => Run into an unknown problem with player.\n${err}`);
                }
                this.queue.delete(serverQueue.guildID);
                return;
            }

            serverQueue.connection.removeAllListeners();
            serverQueue.previous = serverQueue.songs[0];
            this.play(serverQueue);
        });

        serverQueue.connection.on('disconnect', () => {
            try {
                serverQueue.connection.removeAllListeners();
                delete serverQueue.connection;
            } catch (error) {
                console.error(error);
            }
            this.queue.delete(serverQueue.guildID);
        });
    }

    /**
     * Returns a guild queue object if exists
     * @param {string} [guildID]
     * @returns {queueTypes | undefined}
     */
    getPlayer(guildID: string): queueTypes | undefined {
        if (this.queue.has(guildID)) return this.queue.get(guildID);
        else return undefined;
    }

    /**
     * Checks type of provided query. (playlist/video/search)
     * @param {string} [query]
     * @returns {number}
     */
    validateQuery(query: string): number {
        const isVideo = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi // eslint-disable-line
        const isPlaylist = /^.*(list=)([^#\&\?]*).*/gi // eslint-disable-line

        if (isPlaylist.test(query)) return 2;
        else if (isVideo.test(query)) return 1;
        else return 0;
    }

    /**
     * Tries to handle video data and returns it as song object.
     * @param {string} [url]
     * @param {string} [member]
     * @returns {Promise<songTypes | string>}
     */
    async getVideo(url: string, member: string): Promise<songTypes | string> {
        try {
            const data: ytdl.videoInfo = await ytdl.getBasicInfo(url);

            // Return if that's a live content
            if (data.player_response.videoDetails.isLiveContent || data.videoDetails.lengthSeconds === '0')
                return '❗ To get highest possible quality - support for live content is disabled.';

            // Construct song object
            const track: songTypes = {
                title: data.videoDetails.title.replace(/\\(\*|_|`|~|\\)/g, '$1').replace(/(\*|_|`|~|\\)/g, '\\$1'),
                url: `https://www.youtube.com/watch?v=${data.videoDetails.videoId}` || url,
                requester: member,
                duration: this.getVideoLength(Number(data.videoDetails.lengthSeconds))
            };

            return track;
        } catch (error) {
            if (String(error).includes('Video unavailable')) return '⚠️ Provided url is invalid or song from it is currently unavailable.';
            else if (String(error).includes('private video')) return '🔒 Video from provided url is private.';
            else if (String(error).includes('copyright')) return '🔒 Video from provided url is under copyrights.';
            else return '⚠️ I run into unknown error. Contact the bot owner if this problem is common.';
        }
    }

    /**
     * Searches for song and tries to handle it.
     * @param {string} [query]
     * @param {string} [member]
     * @returns {Promise<songTypes | string>}
     */
    async searchVideo(query: string, member: string): Promise<songTypes | string> {
        const video = await this.youtube.searchVideos(query, 1);

        if (!video || !video[0] || !video[0].url) return '❗ I could not find any song with provided title.';
        else return await this.getVideo(video[0].url, member);
    }

    /**
     * Splits total number of seconds into hours, minutes and seconds.
     * @param {number} [rawTime]
     * @returns {durationTypes}
     */
    getVideoLength(rawTime: number): durationTypes {
        const hrs: number = Math.floor(rawTime / 3600);
        const min: number = Math.floor(rawTime / 60) % 60;
        const sec: number = rawTime % 60;

        return {
            hours: hrs,
            minutes: min,
            seconds: sec
        };
    }

    /**
     * Returns a human readable text.
     * @param {durationTypes} [time]
     * @returns {string}
     */
    getReadableTimestamp(time: durationTypes): string {
        if (!time) return '??:??';
        else return `${time.hours ? time.hours + ':' : ''}${time.minutes || '00'}:${time.seconds < 10 ? '0' + time.seconds : time.seconds || '00'}`;
    }

    /**
     * Creates new queue objects and returns it.
     * @param {Message} msg
     * @returns {queueTypes}
     */
    constructNewQueue(msg: Message): queueTypes {
        if (this.queue.has(msg.guildID)) return this.queue.get(msg.guildID);
        else {
            this.queue.set(msg.guildID, {
                guildName: msg.member.guild.name,
                guildID: msg.guildID,
                connection: null,
                songs: [],
                loopMode: 0,
                volume: this.client.config.musicSettings.defaultVolume || 75,
                isBassBoosted: false,
                isPlaying: true
            });

            return this.queue.get(msg.guildID);
        }
    }
}
