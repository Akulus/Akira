import { Message, MessageEmbed } from 'discord.js';
import AkiraClient from '../utils/client';
// @ts-ignore
import lyricsFinder from 'lyrics-finder';
import { trackTypes } from '../typings/playlist';
import ytdl from 'ytdl-core';

export = {
    description: 'Downloads lyrics for the currently playing song.',
    aliases: ['ly'],

    /**
     * Main command function, generator.
     * @param {AkiraClient} [client]
     * @param {Message} [msg]
     * @returns {Promise<Message>}
     */
    async execute(client: AkiraClient, msg: Message): Promise<Message> {
        const lyricsEmbed = new MessageEmbed().setTitle('🔍 Searching for lyrics...');

        const work: Message = await msg.channel.send(lyricsEmbed);
        const songInfo: trackTypes = client.radioManager.getStreamDetails();
        const title = songInfo.title ? songInfo.title : (await ytdl.getBasicInfo(songInfo.url)).player_response.videoDetails.title;
        let lyrics = '';

        try {
            if (!songInfo.title) lyrics = await lyricsFinder(title, '');
            else lyrics = await lyricsFinder(title, songInfo.author ? songInfo.author : '');
        } catch (err) {
            lyrics = '';
        }

        if (typeof lyrics === 'string' && lyrics.length !== 0) {
            lyricsEmbed.setTitle(`🎶 Lyrics for: ${title}`);
            lyricsEmbed.setDescription(`${lyrics.length < 2048 ? lyrics : `${lyrics.slice(0, 2045)}...`}`);
        } else {
            lyricsEmbed.setTitle(`🚫 I could not find any lyrics for: ${title}`);
        }

        lyricsEmbed.setFooter(`Invoked by ${msg.author.username}${msg.member.displayName !== msg.author.username ? ` (aka ${msg.member.displayName})` : ''}`, msg.author.displayAvatarURL());
        return work.edit(lyricsEmbed);
    }
}
