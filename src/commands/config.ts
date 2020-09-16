import { Message, VoiceChannel } from 'discord.js';
import AkiraClient from '../utils/client';

export = {
    description: 'Allows to configure bot parameters for your server.',
    syntax: '<prefix|channel|radio|auto> [value]',
    examples: ['prefix >', 'prefix !!', 'channel 696772062601150518\n', 'radio enable', 'radio disable', 'auto'],
    aliases: ['set', 'option'],
    reqPerms: ['ADMINISTRATOR'],

    /**
     * Main command function, generator.
     * @param {AkiraClient} [client]
     * @param {Message} [msg]
     * @param {string[]} [args]
     * @returns {Promise<Message>}
     */
    async execute(client: AkiraClient, msg: Message, args: string[]): Promise<Message> {
        if (!args[0]) return msg.channel.send('🔎 Missing parameter. Use `help config` command to get more info.');

        if (['auto', 'automatic', 'fix', 'find'].includes(args[0].toLowerCase())) {
            if (!msg.member.voice.channel) return msg.channel.send('🔎 I could not define a correct voice channel. Please join to any before you use that command again.');

            const voiceChannel: VoiceChannel = msg.member.voice.channel;

            if (!msg.guild.me.permissionsIn(voiceChannel).has('CONNECT'))
                return msg.channel.send(`⚠️ I connot connect to \`${voiceChannel.name}\`\nMake sure I always will have permissions to join & speak on selected channel.`);
            else if (!msg.guild.me.permissionsIn(voiceChannel).has('SPEAK'))
                return msg.channel.send(`⚠️ I connot speak on \`${voiceChannel.name}\`\nMake sure I always will have permissions to join & speak on selected channel.`);

            await client.db.asyncUpdate({ guildID: msg.guild.id }, { $set: { voiceChannelID: voiceChannel.id, isEnabled: true } }, { multi: false });

            if (msg.guild.me.voice.channel) {
                client.radioManager.disconnectFromStream(voiceChannel);
                await client.sleep(500);
                await client.radioManager.connectToStream(voiceChannel);
            } else await client.radioManager.connectToStream(voiceChannel);

            return msg.channel.send(`📋 Successfully bound to **${voiceChannel.name}** and **enabled** radio. Enjoy!`);
        }

        if (!args[1]) return msg.channel.send('🔎 Missing value. Use `help config` command to get more info.');

        if (args[0].toLowerCase() === 'prefix') {
            if (args[1].length > 3) return msg.channel.send('⚠️ New prefix is too long. Prefix can use max `3` chars length.');

            await client.db.asyncUpdate({ guildID: msg.guild.id }, { $set: { prefix: args[1] } }, { multi: false });
            return msg.channel.send(`📋 Successfully set **prefix** to \`${args[1]}\``);
        } else if (['channel', 'voice', 'voicechannel'].includes(args[0].toLowerCase())) {
            if (!/^[0-9]+$/.test(args[1])) return msg.channel.send('⚠️ Invalid value. Provide an ID of voice channel where you want to set radio station.');

            const voiceChannel: VoiceChannel = msg.guild.channels.cache.get(args[1]) as VoiceChannel;
            if (!voiceChannel || voiceChannel.type !== 'voice') return msg.channel.send('⚠️ You provided an invalid voice channel ID. I could not find that channel on this server.');

            if (!msg.guild.me.permissionsIn(voiceChannel).has('CONNECT'))
                return msg.channel.send(`⚠️ I connot connect to \`${voiceChannel.name}\`\nMake sure I always will have permissions to join & speak on selected channel.`);
            else if (!msg.guild.me.permissionsIn(voiceChannel).has('SPEAK'))
                return msg.channel.send(`⚠️ I connot speak on \`${voiceChannel.name}\`\nMake sure I always will have permissions to join & speak on selected channel.`);

            await client.db.asyncUpdate({ guildID: msg.guild.id }, { $set: { voiceChannelID: args[1] } }, { multi: false });
            return msg.channel.send(`📋 Successfully binded bot to \`${voiceChannel.name}\` channel.\nUse \`reconnect\` command to reset bot session.`);
        } else if (['radio', 'station', 'transmition', 'connection'].includes(args[0].toLowerCase())) {
            if (['enable', 'on', 'start'].includes(args[1].toLowerCase())) {
                await client.db.asyncUpdate({ guildID: msg.guild.id }, { $set: { isEnabled: true } }, { multi: false });
                return msg.channel.send('📋 Successfully **enabled**. Bot will automatically join to the channel if detect movement.');
            } else if (['disable', 'off', 'stop'].includes(args[1].toLowerCase())) {
                if (msg.guild.me.voice.channelID) {
                    client.log(`Connection from guild ${msg.guild.name} has been closed at user request.`);
                    msg.guild.me.voice.connection.removeAllListeners();
                    msg.guild.me.voice.channel.leave();
                }

                await client.db.asyncUpdate({ guildID: msg.guild.id }, { $set: { isEnabled: false } }, { multi: false });
                return msg.channel.send('📋 Successfully **disabled**. Bot will no longer automatically try to connect & restream music from radio station.');
            } else {
                return msg.channel.send('⚠️ Invalid statement. Decide if bot should restream music or not.');
            }
        } else return msg.channel.send('🔎 Invalid parameter. Available options are: `prefix`, `channel` & `radio`.');
    }
}
