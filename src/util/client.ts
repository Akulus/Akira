import { CommandClient } from 'eris';
import Player from './player.js';
import config from '../config.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import configTypes from '../typings/config.js';

export default class AkiraClient extends CommandClient {
    public readonly player = new Player(this)
    public readonly config: configTypes = config
    public readonly rootPath: string = __dirname || process.cwd()

    /**
     * Tries to register every found command.
     * @returns {void}
     */
    registerEveryCommand(): void {
        readdirSync(join(this.rootPath, '..', 'commands')).forEach((dir) => {
            readdirSync(join(this.rootPath, '..', 'commands', dir)).forEach((commandFile) => {
                if (commandFile.endsWith('.js')) {
                    try {
                        require(join(this.rootPath, "..", "commands", dir, commandFile)).add(this) // eslint-disable-line
                        return console.log(`Succesfully loaded ${join(this.rootPath, '..', 'commands', dir, commandFile)}`);
                    } catch (error) {
                        return console.warn(`Unable to load ${join(this.rootPath, '..', 'commands', dir, commandFile)}\n${error}`);
                    }
                } else {
                    return console.warn(`Unable to load ${join(this.rootPath, '..', 'commands', dir, commandFile)}\nInvalid file extension.`);
                }
            });
        });
    }
}
