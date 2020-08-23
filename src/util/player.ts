import AkiraClient from './client.js';
// @ts-ignore <== Missing @types
import { queueTypes, songTypes, durationTypes } from '../typings/player';
import ytdl from 'ytdl-core';
import scrapeYt from 'scrape-yt';
import { Message } from 'eris';

export default class Player {
    constructor(client: AkiraClient) {
        this.client = client;
        this.queue = new Map();
    }

    private readonly client: AkiraClient
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
        const video = await scrapeYt.getVideo(ytdl.getVideoID(url), { useWorkerThread: false });
        if(!video || Object.keys(video).length === 0) return '❗ I could not find any song using provided url. *(content may be private or unavailable)*';

        // Check if it's not a live content
        // @ts-ignore
        if(video.isLiveContent || !video.duration || video.duration === 0) return '❗ To get highest possible quality - support for live content is disabled.';

        return { // @ts-ignore - please, somebody kill me with these {}
            title: video.title, // @ts-ignore
            url: `https://www.youtube.com/watch?v=${video.id}` || url,
            requester: member, // @ts-ignore
            duration: this.getVideoLength(video.duration)
        };
    }

    /**
     * Searches for song and tries to handle it.
     * @param {string} [query]
     * @param {string} [member]
     * @returns {Promise<songTypes | string>}
     */
    async searchVideo(query: string, member: string): Promise<songTypes | string> {
        const videos = await scrapeYt.search(query, { type: 'video', limit: 1, page: 1, useWorkerThread: false});

        if(!videos || videos.length === 0) return '❗ I could not find any song using provided url. *(maybe adding more details may help?)*';

        // Check if it's not a live content
        // @ts-ignore
        if(videos[0].isLiveContent || !videos[0].duration || videos[0].duration === 0) return '❗ To get highest possible quality - support for live content is disabled.';

        return { // @ts-ignore - please, somebody kill me with these partial types
            title: videos[0].title, // @ts-ignore
            url: `https://www.youtube.com/watch?v=${videos[0].id}` || url,
            requester: member, // @ts-ignore
            duration: this.getVideoLength(videos[0].duration)
        };
    }

    /**
     * Tries to grab multiple songs from playlist.
     * @param {string} [playlistURL]
     * @param {string} [member]
     * @returns {playlistPayload | string>}
     */
    // async getPlaylist(playlistURL: string, member: string): Promise<playlistPayload | string> {
    //     const payload: playlistPayload = {
    //         playlistData: {
    //             title: undefined,
    //             duration: {
    //                 hours: 0,
    //                 minutes: 0,
    //                 seconds: 0
    //             }
    //         },
    //         tracks: []
    //     };

    //     let rawVideos: Array<any> = []; // eslint-disable-line

    //     try {
    //         const playlist: any = await this.youtube.getPlaylist(playlistURL, { part: 'snippet' }); // eslint-disable-line
    //         rawVideos = await playlist.getVideos(this.client.config.musicSettings.playlistLimit || 50, { part: 'snippet' });
    //         payload.playlistData.title = playlist.title;
    //     } catch (_) {
    //         return '❗ I could not find any tacks from provided playlist url.';
    //     }

    //     rawVideos.forEach((video) => {
    //         console.log(typeof video.durationSeconds);
    //     });
    // }

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
