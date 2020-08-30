import AkiraClient from './client';
import { VoiceState, VoiceChannel, VoiceBroadcast, BroadcastDispatcher } from 'discord.js';
import guildDataTypes from '../typings/database';
import songs from '../songs.json';
import ytdl from 'ytdl-core';

export default class RadioManager {
    constructor(client: AkiraClient, broadcast: VoiceBroadcast) {
        this.client = client;
        this.station = broadcast;
    }

    private readonly client: AkiraClient
    private readonly station: VoiceBroadcast

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
            if (newState.channel.joinable && newState.channel.speakable && !newState.channel.full) {
                await newState.channel.join().then((connection) => {
                    connection.voice.setSelfDeaf(true);
                    connection.play(this.station).on('error', (err) => {
                        console.log(`[Radio Manager] Guild: ${newState.guild.name} run into a problem with connection.\n${err}`);
                        connection.removeAllListeners();
                        newState.channel.leave();
                    });
                });
            }
        }

        // Run timer if bot is on empty channel - leave from voice channel after 30 seconds
        let botVoiceChannel: VoiceChannel = undefined;

        if (oldState.channelID && oldState.channelID === guildData.voiceChannelID) botVoiceChannel = oldState.channel;
        else if (newState.channelID && newState.channelID === guildData.voiceChannelID) botVoiceChannel = newState.channel;
        else return;

        if (botVoiceChannel.members.size <= 1 && oldState.guild.me.voice.channelID) {
            console.log(`[Radio Manager] Connection from guild: ${newState.guild.name} has been closed due to inactivity.`);
            oldState.guild.me.voice.connection.removeAllListeners();
            botVoiceChannel.leave();
        }

        // Protect bot from moving to different channels
        if (newState.member.id === newState.guild.me.id) {
            if (newState.channelID && newState.channelID !== botVoiceChannel.id) newState.guild.me.voice.setChannel(botVoiceChannel);
        }
    }

    /**
     * Main function that decide what should be played via broadcast.
     * @param {number} [last]
     * @returns {Promise<void>}
     */
    async streamNext(last: number): Promise<void> {
        let randomizer: number = Math.floor(Math.random() * songs.length);
        while (last === randomizer) randomizer = Math.floor(Math.random() * songs.length);

        const player: BroadcastDispatcher = this.station.play(ytdl(songs[randomizer].url, { highWaterMark: 12 << 25, liveBuffer: 75000 }), { highWaterMark: 1 });

        player.on('error', () => {
            console.log(`[Radio Manager] Occured problem while trying to play ${randomizer}'s song: ${songs[randomizer].title}\nSkipping to the other, random track!`);
            player.removeAllListeners();
            return this.streamNext(randomizer);
        });

        player.on('finish', () => {
            return this.streamNext(randomizer);
        });
    }
}
