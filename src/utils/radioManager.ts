import AkiraClient from './client';

export default class RadioManager {
    constructor(client: AkiraClient) {
        this.client = client;
    }

    private readonly client: AkiraClient
}
