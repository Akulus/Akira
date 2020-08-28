import { CommandClient } from 'eris';
import Player from './player.js';
import config from '../config.js';

export default class AkiraClient extends CommandClient {
    public readonly player = new Player(this, process.env.YOUTUBE_KEY)
    public readonly config = config
}
