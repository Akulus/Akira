import { Message } from 'eris';
import AkiraClient from '../../util/client.js';

export function add(client: AkiraClient): void {
    client.registerCommand(
        'ping',
        (msg: Message) => {
            msg.channel.createMessage(`Pong! \`~${client.guilds.get(msg.guildID).shard.latency}ms\``);
        },
        {
            aliases: ['pong'],
            argsRequired: false
        }
    );
}
