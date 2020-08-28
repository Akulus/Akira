import Youtube from 'simple-youtube-api';
export default class Player {
    constructor(client, ytKey) {
        this.client = client;
        this.youtube = new Youtube(ytKey);
    }
}
