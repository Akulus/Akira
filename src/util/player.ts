import AkiraClient from './client.js';
// @ts-ignore <== Missing @types
import Youtube from 'simple-youtube-api';
import { queueTypes } from '../typings/player';

export default class Player {
    constructor(client: AkiraClient, ytKey: string) {
        this.client = client;
        this.youtube = new Youtube(ytKey);
    }

    private readonly client: AkiraClient
    public youtube: Youtube
    public readonly queue: Map<string, queueTypes>
}
