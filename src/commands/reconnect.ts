import { Message, VoiceChannel } from 'discord.js';
import AkiraClient from '../utils/client';
import guildDataTypes from '../typings/database';

export = {
    description: 'Tries to automatically resolve problem with connection.',
    aliases: ['fix', 'repair', 'recc'],
    reqPerms: ['MOVE_MEMBERS'],

    /**
     * Main command function, generator.
     * @param {AkiraClient} [client]
     * @param {Message} [msg]
     * @returns {Promise<Message>}
     */
    async execute(client: AkiraClient, msg: Message): Promise<Message> {
        const guildData: guildDataTypes = await client.commandManager.getInfoFromDatabase(msg);

        if (!guildData.isEnabled) return msg.channel.send('⚠️ Radio is disabled on this server. Type: `config radio enable` to turn back on radio.');
        else if (!guildData.voiceChannelID) return msg.channel.send('⚠️ Bot is not configured yet. Type `config channel <voice channel ID>` to bind bot to selected channel.');

        const botVoiceChannel: VoiceChannel = msg.guild.channels.cache.get(guildData.voiceChannelID) as VoiceChannel;

        if (!botVoiceChannel)
            return msg.channel.send(`🔎 I could not find voice channel with ID \`${guildData.voiceChannelID}\`.\nPlease bind me to valid channel by typing: \`config channel <voice channel ID>\``);
        else if (!botVoiceChannel.joinable || !botVoiceChannel.speakable)
            return msg.channel.send(`⚠️ I cannot join to/speak on ${botVoiceChannel.name} channel. Make sure I always will have permissions to freely join & speak on that channel.`);

        if (!msg.member.voice.channelID || (msg.member.voice.channelID && msg.member.voice.channelID !== guildData.voiceChannelID))
            return msg.channel.send(`⚠️ You need to join to \`${botVoiceChannel.name}\` channel before you execute this command.`);

        if (msg.guild.me.voice.channelID) {
            console.log(`[Radio Manager] Reconnecting guild ${msg.guild.name} at user request.`);

            client.radioManager.disconnectFromStream(botVoiceChannel);
            await client.sleep(500);
            await client.radioManager.connectToStream(botVoiceChannel);
            return msg.channel.send(`🛠️ Successfully **established** connection with \`${botVoiceChannel.name}\` channel.`);
        } else {
            await client.radioManager.connectToStream(botVoiceChannel);
            return msg.channel.send(`🛠️ Successfully **established** connection with \`${botVoiceChannel.name}\` channel.`);
        }
    }
}
