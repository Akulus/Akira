import { Message, MessageEmbed } from 'discord.js';
import AkiraClient from '../utils/client';
import { inspect } from 'util';

export = {
    description: 'Executes JavaScript code on live.',
    syntax: '<.js code>',
    examples: ['1+2', 'client.guilds.cache.type'],
    aliases: ['eval'],
    reqOwner: true,

    /**
     * Main command function, generator.
     * @param {AkiraClient} [client]
     * @param {Message} [msg]
     * @param {string[]} [args]
     * @returns {Promise<Message>}
     */
    async execute(client: AkiraClient, msg: Message, args: string[]): Promise<Message> {
        if (!args[0]) return msg.channel.send('🔎 I found nothing to evaluate. Please send JavaScript code if you want to run it.');

        const evalInfo = new MessageEmbed()
            .setTitle('🛠️ Result of evaluated code')
            .setFooter(`Invoked by ${msg.author.username}${msg.member.displayName !== msg.author.username ? ` (aka ${msg.member.displayName})` : ''}`, msg.author.displayAvatarURL())
            .setTimestamp();

        const hrStart = process.hrtime();

        try {
            let evaled: string | unknown = await eval(args.join(' '));
            const hrDiff = process.hrtime(hrStart);

            if (typeof evaled !== 'string') {
                evaled = inspect(evaled);
            }

            const result: string = sanitize(evaled);

            evalInfo.addField('✩ Status', 'Success', true);
            evalInfo.addField('✩ Executed in', `\`${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms\``, true);

            if (result && result !== '') {
                if (result.length > 2040) {
                    evalInfo.setDescription('```css\n[Output log is too long. Check bot console.]```');
                    console.log(result);
                } else evalInfo.setDescription(`\`\`\`js\n${result}\n\`\`\``);
            }
        } catch (error) {
            const hrDiff = process.hrtime(hrStart);

            evalInfo.addField('✩ Status', 'Fail', true);
            evalInfo.addField('✩ Executed in', `\`${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms\``, true);

            const result: string = sanitize(error);

            if (result && result !== '') {
                if (result.length > 2040) {
                    evalInfo.setDescription('```css\n[Output log is too long. Check bot console.]```');
                    console.log(result);
                } else evalInfo.setDescription(`\`\`\`js\n${result}\n\`\`\``);
            }
        }

        return msg.channel.send(evalInfo);
    }
}

/**
 * Clears text.
 * @param text {string | unknown}
 * @returns {string}
 */
function sanitize(text: string | unknown): string {
    if (typeof text === 'string') {
        return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
    } else {
        return String(text);
    }
}
