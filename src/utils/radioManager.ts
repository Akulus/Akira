import AkiraClient from './client';
import { VoiceState, VoiceChannel, VoiceBroadcast, BroadcastDispatcher } from 'discord.js';
import guildDataTypes from '../typings/database';
import songs from '../songs.json';
import ytdl from 'ytdl-core';
import trackTypes from '../typings/track';

export default class RadioManager {
    constructor(client: AkiraClient, broadcast: VoiceBroadcast) {
        this.client = client;
        this.station = broadcast;
        this.lastTracks = [];
    }

    private readonly client: AkiraClient
    private readonly station: VoiceBroadcast
    private lastTracks: Array<number>

    /**
     * Detects when bot should join/leave.
     * @param {VoiceState} [oldState]
     * @param {VoiceState} [oldState]
     * @returns {Promise<void>}
     */
    async triggerMovement(oldState: VoiceState, newState: VoiceState): Promise<void> {
        const guildData: guildDataTypes = await this.client.db.asyncFindOne({ guildID: oldState.guild.id });
        if (!guildData || this.client.isEmpty(guildData) || !guildData.voiceChannelID) return;

        // Check if member just joined to a server - if yes, check if it's first - if yes, spawn connection
        if (newState.channelID && newState.channelID === guildData.voiceChannelID && newState.channel.members.size === 1) {
            if (guildData.isEnabled) await this.connectToStream(newState.channel);
        }

        // Run timer if bot is on empty channel - leave from voice channel after 30 seconds
        let botVoiceChannel: VoiceChannel = undefined;

        if (oldState.channelID && oldState.channelID === guildData.voiceChannelID) botVoiceChannel = oldState.channel;
        else if (newState.channelID && newState.channelID === guildData.voiceChannelID) botVoiceChannel = newState.channel;
        else return;

        // Protect bot from moving to different channels
        if (newState.member.id === newState.guild.me.id) {
            if (newState.channelID && newState.channelID !== botVoiceChannel.id) newState.guild.me.voice.setChannel(botVoiceChannel);
        }

        if (botVoiceChannel.members.size <= 1 && oldState.guild.me.voice.channelID) return this.disconnectFromStream(botVoiceChannel);
    }

    /**
     * Main function that decide what should be played via broadcast.
     * @returns {Promise<void>}
     */
    async streamNext(): Promise<void> {
        const selected: number = this.getTrueRandom();

        const player: BroadcastDispatcher = this.station.play(ytdl(songs[selected].url, { highWaterMark: 12 << 25, liveBuffer: 75000 }), { highWaterMark: 1 });

        player.on('error', () => {
            console.log(`[Radio Manager] Occured problem while trying to play ${selected}'s song: ${songs[selected].title}\nSkipping to the other, random track!`);
            player.removeAllListeners();
            return this.streamNext();
        });

        player.on('finish', () => {
            return this.streamNext();
        });
    }

    /**
     * Returns current song object.
     * @returns {trackTypes}
     */
    getStreamDetails(): trackTypes {
        return songs[this.lastTracks[this.lastTracks.length - 1]];
    }

    /**
     * Connects bot to a voice channel and subscribes broadcast.
     * @param {VoiceChannel} [channel]
     * @returns {Promise<void>}
     */
    async connectToStream(channel: VoiceChannel): Promise<void> {
        if (!channel) return;

        if (channel.joinable && channel.speakable && !channel.full) {
            await channel.join().then((connection) => {
                connection.voice.setSelfDeaf(true);
                connection.play(this.station).on('error', (err) => {
                    console.log(`[Radio Manager] Guild ${channel.guild.name} run into a problem with connection.\n${err}`);
                    connection.removeAllListeners();
                    channel.leave();
                });
            });
        }
        return;
    }

    /**
     * Disconnects bot from a voice channel and unsubscribes broadcast.
     * @param {VoiceChannel} [channel]
     * @returns {void}
     */
    disconnectFromStream(channel: VoiceChannel): void {
        if (!channel) return;
        try {
            channel.guild.me.voice.connection.dispatcher.destroy();
        } catch (err) {} // eslint-disable-line

        try {
            channel.guild.me.voice.connection.removeAllListeners();
        } catch (e) {} // eslint-disable-line
        channel.leave();
    }

    /**
     * If multiple - Returns every author from new line.
     * @param {string} [authors]
     * @returns {string}
     */
    parseAuthors(authors: string): string {
        if (!authors || authors === '') return 'Unknown';

        if (!/,/.test(authors)) return authors;
        else {
            const x: string[] = authors.split(', ');
            const y: string[] = x[x.length - 1].split(' & ');
            if (/&/.test(x[x.length - 1])) x.pop();
            return `${x.join(',\n')},\n${y.join(',\n')}`;
        }
    }

    /**
     * Generates truly random number that can be the same like the last 10.
     * @returns {number}
     */
    getTrueRandom(): number {
        let x: number = Math.floor(Math.random() * songs.length);
        while (this.lastTracks.includes(x)) x = Math.floor(Math.random() * songs.length);

        this.lastTracks.push(x);
        if (this.lastTracks.length > 10) this.lastTracks.shift();

        return this.lastTracks[this.lastTracks.length - 1];
    }
}
