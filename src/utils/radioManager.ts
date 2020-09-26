import AkiraClient from './client';
import { VoiceState, VoiceChannel, VoiceBroadcast, BroadcastDispatcher, Collection } from 'discord.js';
import guildDataTypes from '../typings/database';
import ytdl from 'ytdl-core';
import { readdirSync } from 'fs';
import { join } from 'path';
import { playlistTypes, trackTypes } from '../typings/playlist';

export default class RadioManager {
    constructor(client: AkiraClient, broadcast: VoiceBroadcast) {
        this.client = client;
        this.station = broadcast;
        this.lastTracks = [];
    }

    public readonly playlists = new Collection<string, playlistTypes>()
    private readonly volume: number = this.getVolume()
    private readonly client: AkiraClient
    private readonly station: VoiceBroadcast
    private readonly lastTracks: Array<number>
    public playlist: playlistTypes

    /**
     * Detects when bot should join/leave.
     * @param {VoiceState} [oldState]
     * @param {VoiceState} [newState]
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
     * Detects & loads default selected playlist.
     * @returns {Promise<void>}
     */
    async registerPlaylists(): Promise<void> {
        for (const playlist of readdirSync(join(__dirname, '..', 'playlists'))) {
            if (!playlist.endsWith('.json')) return this.client.log(`Playlist ${playlist} have invalid file extension.`, -4);

            const station: playlistTypes = require(join(__dirname, "..", "playlists", playlist)) // eslint-disable-line

            if (!station.title || !station.tag) return this.client.log(`Playlist "${playlist}" does not have a title or unique tag.`, -4);
            else if (station.title.length > 24 || station.tag.length > 5) return this.client.log(`Playlist ${station.title} have too long name or tag.\nLimits: Title - 24, TAG - 5`, -4);
            else if (!station.songs || station.songs.length === 0) return this.client.log(`Playlist ${station.title} is empty.`, -4);
            else if (station.songs.length <= 10) return this.client.log(`Playlist ${station.title} can't be used because it needs to have more than 10 working songs.`, -4);

            this.playlists.set(station.tag, station);
        }
        if (this.playlists.size === 0) return this.client.log('I could not find any working playlists. Please define at least 1 to start.', -10);
        this.client.log(`Successfully detected & loaded playlist(s): ${this.playlists.map((station) => station.title).join(', ')}.`, -4);
    }

    /**
     * Prepare & tries to load default playlist.
     * @param {string} [tag]
     * @returns {void}
     */
    resolvePlaylistToStream(tag: string): void {
        const selectedPlaylist: playlistTypes = this.playlists.find((p) => p.tag.toLowerCase() === tag.toLowerCase() || p.title.toLowerCase() === tag.toLowerCase());
        if (!selectedPlaylist) return this.client.log(`I could find any working playlist registered under "${tag.toUpperCase()}" TAG. Check your .env file.`, -10);

        this.playlist = selectedPlaylist;
        return this.client.log(`Set main playlist to: [${selectedPlaylist.tag.toUpperCase()}] ${selectedPlaylist.title}${selectedPlaylist.author ? `\nCreated by ${selectedPlaylist.author}.` : ''}`);
        //#TODO - Create smooth volume changing, wave style music switcher
    }

    /**
     * Searches & tries to load other playlist.
     * @param {string} [query]
     * @returns {number}
     */
    changePlaylistToStream(query: string): number {
        const selectedPlaylist: playlistTypes = this.playlists.find((p) => p.tag.toLowerCase() === query.toLowerCase() || p.title.toLowerCase() === query.toLowerCase());
        if (!selectedPlaylist) return 1;

        this.playlist = selectedPlaylist;
        this.forceSkip();
        this.client.log(`Set main playlist to: [${selectedPlaylist.tag.toUpperCase()}] ${selectedPlaylist.title}${selectedPlaylist.author ? `\nCreated by ${selectedPlaylist.author}.` : ''}`);
        return 0;
    }

    /**
     * Main function that decide what should be played via broadcast.
     * @returns {Promise<void>}
     */
    async stream(): Promise<void> {
        const selected: number = this.getTrueRandom();

        const player: BroadcastDispatcher = this.station.play(ytdl(this.playlist.songs[selected].url, { highWaterMark: 4 << 25, filter: 'audioonly', quality: 'highestaudio' }), {
            highWaterMark: 1,
            bitrate: 'auto'
        });

        player.setVolumeLogarithmic(this.volume / 100);

        player.on('error', () => {
            this.client.log(`Occured problem while trying to play ${selected}'s song: ${this.playlist.songs[selected].title}\nSkipping to the other, random track!`, 2);
            player.removeAllListeners();
            return this.stream();
        });

        player.on('finish', () => {
            return this.stream();
        });
    }

    /**
     * Forces radio Manager to skip currently played song.
     * @returns {Promise<void>}
     */
    async forceSkip(): Promise<void> {
        let x: number = this.volume;

        while (x > 0) {
            x = x - 1;
            this.station.dispatcher.setVolumeLogarithmic(x / 100);
            await this.client.sleep(500);
        }

        this.station.removeAllListeners();
        this.stream();
        return;
    }

    /**
     * Returns current song object.
     * @returns {trackTypes}
     */
    getStreamDetails(): trackTypes {
        return this.playlist.songs[this.lastTracks[this.lastTracks.length - 1]];
    }

    /**
     * Returns basic data about broadcast
     * @returns {string}
     */
    async getBroadcastDetails(): Promise<string> {
        return `Station: \`Akira Radio\`\nCurrent music plan:\n\`[${this.playlist.tag.toUpperCase()}] ${this.playlist.title}\`\nCurrent bitrate: \`384kbps\`\nDefault volume: \`${
            this.volume
        }%\`\nConnections: \`${this.station.subscribers.length}\``;
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
                    this.client.log(`Guild ${channel.guild.name} run into a problem with connection.\n${err}`, 1);
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
        let x: number = Math.floor(Math.random() * this.playlist.songs.length);
        while (this.lastTracks.includes(x)) x = Math.floor(Math.random() * this.playlist.songs.length);

        this.lastTracks.push(x);
        if (this.lastTracks.length > 10) this.lastTracks.shift();

        return this.lastTracks[this.lastTracks.length - 1];
    }

    /**
     * Returns number from 1 to 100 that validates stream volume level.
     * @returns {number}
     */
    getVolume(): number {
        let input: string | number = process.env.DEFAULT_VOLUME;

        if (!input || input === '' || !/^[0-9]+$/.test(input)) {
            this.client.log('You did not specify default volume option inside .env file or provided value is invalid. Automatically set volume to 15%', -4);
            return 15;
        }

        input = Math.floor(Number(input));
        if (input > 100) input = 100;
        else if (input < 1) input = 1;
        return input;
    }
}
