// @ts-ignore <= Missing @types
import Youtube from 'simple-youtube-api';
import { queueTypes, songTypes, durationTypes } from '../typings/player';
import ytdl from 'ytdl-core';
import { Util, VoiceChannel, StreamDispatcher } from 'discord.js';
import AkiraClient from './client';

export default class Player {
    constructor(client: AkiraClient) {
        this.queue = new Map();
        this.client = client;
        this.youtube = new Youtube(client.config.keys.youtubeAPI);
    }

    private readonly youtube: unknown
    private readonly client: AkiraClient
    public readonly queue: Map<string, queueTypes>

    /**
     * Checks provided by member query and return number.
     * 2 = Playlist
     * 1 = Regular video
     * 0 = Unknown, search using youtube key
     *
     * @param query {string}
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
     * Tries to grab video data from provided url.
     * @param query {string}
     * @param memberTag {string}
     * @returns {Promise<songTypes | string>}
     */
    async getVideo(query: string, memberTag: string): Promise<songTypes | string> {
        try {
            const videoData = await ytdl.getBasicInfo(query);

            const track: songTypes = {
                title: Util.escapeMarkdown(videoData.videoDetails.title),
                url: `https://www.youtube.com/watch?v=${videoData.videoDetails.videoId}`,
                requester: memberTag,
                isLive: undefined
            };

            // Check if it's a live content
            if (videoData.player_response.videoDetails.isLiveContent || videoData.videoDetails.lengthSeconds === '0') {
                track.isLive = true;
            } else {
                track.isLive = false;
                track.duration = this.getVideoLength(parseInt(videoData.videoDetails.lengthSeconds));
            }

            return track;
        } catch (error) {
            return String(error);
        }
    }

    /**
     * Converts rawTime (seconds) to durationTypes object.
     * @param rawTime {number}
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

    getReadableTimestamp(song: songTypes): string {
        if (!song) return '00:00:00';

        if (song.isLive) return '∞';
        else
            return `${song.duration.hours ? song.duration.hours + ':' : ''}${song.duration.minutes || '00'}:${
                song.duration.seconds < 10 ? '0' + song.duration.seconds : song.duration.seconds || '00'
            }`;
    }

    /**
     * Creates new player queue model for selected servver.
     * @param guildID
     */
    createQueue(guildID: string, guildName: string, voiceChannel: VoiceChannel): queueTypes {
        const serverQueue: queueTypes | undefined = this.queue.get(guildID);
        if (serverQueue) return serverQueue;
        else {
            this.queue.set(guildID, {
                guildName: guildName,
                guildID: guildID,
                voiceChannel: voiceChannel,
                connection: undefined,
                loopMode: 0,
                previous: undefined,
                volume: this.client.config.playerOptions.defaultVolume || 75,
                songs: [],
                playing: true
            });

            return this.queue.get(guildID);
        }
    }

    /**
     * Main function, reads stream & plays music.
     * @param serverQueue {queueTypes}
     * @returns {Promise<void>}
     */
    async play(serverQueue: queueTypes): Promise<void> {
        const playerOptions: ytdl.downloadOptions = this.getFilterOptions(serverQueue.songs[0].isLive);
        const dispatcher: StreamDispatcher = serverQueue.connection.play(ytdl(serverQueue.songs[0].url, playerOptions), {
            highWaterMark: 1,
            volume: false,
            bitrate: 96 << 384 || 'auto'
        });

        dispatcher.on('finish', () => {
            // loopMode: 0 = disabled, 1 = for all tracks & 2 = only for current, single song
            if (serverQueue.loopMode === 1) serverQueue.songs.push(serverQueue.songs[0]);
            if (serverQueue.loopMode < 2) serverQueue.songs.shift();

            if (!serverQueue.songs[0]) {
                try {
                    serverQueue.connection.disconnect();
                    this.queue.delete(serverQueue.guildID);
                } catch (err) {
                    this.client.log(`${serverQueue.guildName} => Run into an unknown problem with player.\n${err}`, 'warn');
                }
                return;
            }

            serverQueue.previous = serverQueue.songs[0];
            this.play(serverQueue);
        });

        // Below these 2 event listeners are created only to minimalize risk of bot crash due to idiot bot usage

        dispatcher.on('error', (err: string) => {
            this.client.log(`${serverQueue.guildName} => Run into problem while streaming music.\n${err}`, 'warn');
            serverQueue.songs.shift();

            if (!serverQueue.songs[0]) {
                try {
                    serverQueue.connection.disconnect();
                    this.queue.delete(serverQueue.guildID);
                } catch (err) {
                    this.client.log(`${serverQueue.guildName} => Run into an unknown problem with player.\n${err}`, 'warn');
                }
                return;
            }

            this.play(serverQueue);
        });

        serverQueue.connection.on('disconnect', () => this.queue.delete(serverQueue.guildID));
    }

    /**
     * Selects best options for video or live stream.
     * @param isLiveContent {boolean}
     * @returns {ytdl.downloadOptions}
     */
    getFilterOptions(isLiveContent: boolean): ytdl.downloadOptions {
        if (!isLiveContent) {
            return { quality: 'highestaudio', highWaterMark: 1 << 25, filter: 'audioonly' };
        } else {
            return { highWaterMark: 1 << 25, filter: 'audioonly', liveBuffer: 12500 };
        }
    }
}
