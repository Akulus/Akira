import { Message, MessageEmbed, BitFieldResolvable, PermissionString } from 'discord.js';
import AkiraClient from '../utils/client';
import commandTypes from '../typings/command';

export = {
    description: 'Displays all commands and their descriptions.',
    syntax: '[command name]',
    aliases: ['list', 'h'],

    /**
     * Main command function, generator.
     * @param {AkiraClient} [client]
     * @param {Message} [msg]
     * @param {string[]} [args]
     * @returns {Promise<Message>}
     */
    async execute(client: AkiraClient, msg: Message, args: string[]): Promise<Message> {
        const helpInfo = new MessageEmbed().setFooter(
            `Invoked by ${msg.author.username}${msg.member.displayName !== msg.author.username ? ` (aka ${msg.member.displayName})` : ''}`,
            msg.author.displayAvatarURL()
        );

        if (!args[0]) {
            helpInfo.setTitle('📜 List with all commands');
            helpInfo.setDescription(`${client.commandManager.generateHelpPage()}\n\n\`❪ Syntax: [] - optional, <> - required ❫\``);

            return msg.channel.send(helpInfo);
        } else {
            const command: commandTypes | undefined = client.commandManager.getCommandInfo(args[0]);
            if (!command) return msg.channel.send('🔎 I could not find that command. Type `help` to get list with all commands.');

            helpInfo.setTitle(`🔎 Viewing command ⇒ ${command.name}`);
            helpInfo.addField('Usage', `\`${command.name}${command.syntax ? ` ${command.syntax}` : ''}\``, true);
            if (command.aliases) helpInfo.addField('Aliases', command.aliases.map((a) => `\`${a}\``).join(', '), true);
            helpInfo.addField('Additional requirements', `Need Owner? ${command.reqOwner ? '`Yes' : '`No`'}\nPermissions? \`${checkPermissions(command.reqPerms)}\``, true);
            helpInfo.addField('‎', '‎', false);
            if (command.examples) helpInfo.addField('Examples:', `\`\`\`${command.examples.map((ex) => `✩ ${command.name} ${ex}`).join('\n')}\`\`\``, true);
            helpInfo.addField('Description', `\`\`\`${command.description}\`\`\``, true);

            return msg.channel.send(helpInfo);
        }
    }
}

/**
 * Returns yes or no data depending on permissions list.
 * @param {BitFieldResolvable<PermissionString>}
 * @returns {string}
 */
function checkPermissions(all: BitFieldResolvable<PermissionString>): string {
    if (!all) return 'No';
    if (all.toString() === '') return 'No';

    const x: string | string[] = all.toString().split(',');
    if (typeof x === 'string') return 'Yes [1]';
    else return `Yes [${x.length}]`;
}
