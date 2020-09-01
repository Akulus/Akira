import AkiraClient from './client';
import { Collection, Message } from 'discord.js';
import commandTypes from '../typings/command';
import { readdirSync } from 'fs';
import { join } from 'path';
import guildDataTypes from '../typings/database';

export default class CommandManager {
    constructor(client: AkiraClient) {
        this.client = client;
    }

    private readonly client: AkiraClient
    private readonly commands = new Collection<string, commandTypes>()
    public readonly owners: string[] = this.getOwnerIDs()

    /**
     * Detects & binds all command files.
     * @returns {TypeError | void}
     */
    registerCommands(): TypeError | void {
        for (const file of readdirSync(join(__dirname, '..', 'commands'))) {
            if (!file.endsWith('.js')) return new TypeError(`[Command Manager] File ${file} have invalid file extension.`);

            const command: commandTypes = require(join(__dirname, "..", "commands", file)) // eslint-disable-line
            command.name = file.slice(0, -3);
            if (!command.reqPerms) command.reqPerms = [];

            this.commands.set(command.name, command);
        }
        console.log(`[Command Manager] Detected ${this.commands.size} commands.`);
    }

    /**
     * Command event emitter.
     * @param {Message} [msg]
     * @returns {void}
     */
    async parseMessage(msg: Message): Promise<void> {
        if (msg.author.bot || !msg.guild) return;
        else if (!msg.guild.me.permissionsIn(msg.channel).has('SEND_MESSAGES')) return;

        const guildData: guildDataTypes = await this.getInfoFromDatabase(msg);

        if (!msg.content.startsWith(guildData.prefix) || msg.content.length <= guildData.prefix.length) return;

        const args: string[] = msg.content.slice(guildData.prefix.length).trim().split(/ +/g);
        const cmd: string = args.shift().toLowerCase();
        const command: commandTypes | undefined = this.commands.find((c) => c.name === cmd || (c.aliases && c.aliases.includes(cmd)));
        if (!command) return;

        if (!msg.member.hasPermission(command.reqPerms)) {
            msg.channel.send(`⚠️ You do not have permission to use this command.\nRequired: \`[${command.reqPerms.toString()}]\``);
            return;
        } else if (command.reqOwner && !this.owners.includes(msg.author.id)) {
            msg.channel.send('⚠️ Only bot owner can execute this command.');
            return;
        }

        return command.execute(this.client, msg, args);
    }

    /**
     * Checks if guild with provided ID is registered in database. If not - generate new object.
     * @param {Message} [msg]
     * @returns {Promise<guildDataTypes>}
     */
    async getInfoFromDatabase(msg: Message): Promise<guildDataTypes> {
        let guildData = await this.client.db.asyncFindOne({ guildID: msg.guild.id });
        if (!guildData || this.client.isEmpty(guildData)) {
            guildData = {
                guildID: msg.guild.id,
                prefix: 'a!',
                isEnabled: false
            };

            await this.client.db.asyncInsert(guildData);
            guildData = await this.client.db.asyncFindOne({ guildID: msg.guild.id });
        }
        return guildData;
    }

    /**
     * Parses owners string from .env file and splits it.
     * @private
     * @returns {string[]}
     */
    getOwnerIDs(): string[] {
        const owners: string[] = [];

        if (process.env.OWNERS === '' || typeof process.env.OWNERS === 'undefined') return [];
        let data: string | string[] = process.env.OWNERS.replace(/\s+/g, '');

        data = data.split(',');
        if (typeof data === 'string') {
            owners.push(data);
        } else {
            data.forEach((id) => owners.push(id));
        }
        return owners;
    }

    /**
     * Generates list with all available commands and their descriptions.
     * @returns {string}
     */
    generateHelpPage(): string {
        return this.commands.map((cmd) => `**» ${cmd.name} ${cmd.syntax ? cmd.syntax : ''}**\n*${cmd.description}*`).join('\n\n');
    }

    /**
     * Returns data about command if exist.
     * @param {string} [name]
     * @returns {commandTypes | undefined}
     */
    getCommandInfo(name: string): commandTypes | undefined {
        const command: commandTypes | undefined = this.commands.find((c) => c.name === name || (c.aliases && c.aliases.includes(name)));
        if (!command) return undefined;
        else return command;
    }
}
