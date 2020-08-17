import { VoiceChannel, VoiceConnection } from 'discord.js';

interface queueTypes {
    guildName: string
    guildID: string
    voiceChannel: VoiceChannel
    connection: VoiceConnection
    loopMode: number
    previous: songTypes
    //bassbost: boolean | Bassbost mode lost it support
    volume: number
    songs: Array<songTypes>
    playing: boolean
}

interface songTypes {
    title: string
    url: string
    duration?: durationTypes
    requester: string
    isLive: boolean
}

interface durationTypes {
    hours: number
    minutes: number
    seconds: number
}

export { queueTypes, songTypes, durationTypes };
