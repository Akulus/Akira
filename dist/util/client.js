import { CommandClient } from 'eris';
import Player from './player.js';
import config from '../config.js';
export default class AkiraClient extends CommandClient {
    constructor() {
        super(...arguments);
        this.player = new Player(this, process.env.YOUTUBE_KEY);
        this.config = config;
    }
}
