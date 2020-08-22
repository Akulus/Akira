import { VoiceConnection } from 'eris';

interface queueTypes {
    guildName: string
    guildID: string
    connection: VoiceConnection
    songs: Array<songTypes>
    loopMode: number
    volume: number
    previous?: songTypes
    isBassBoosted: boolean
    isPlaying: boolean
}

interface songTypes {
    title: string
    url: string
    requester: string
    duration: durationTypes
    votesToSkip?: number // Optional
    votesToEnd?: number // Optional
}

interface durationTypes {
    hours: number
    minutes: number
    seconds: number
}

export { queueTypes, songTypes, durationTypes };
