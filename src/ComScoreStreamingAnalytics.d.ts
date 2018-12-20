export declare class ComScoreStreamingAnalytics {
    private player;
    private tracker;
    private config;
    private sessionIsActive;
    private contentDefined;
    private isAd;
    private debug;
    private stub;
    constructor(player: any, config: any);
    registerPlayerEvents(): void;
    playbackHasStarted(): void;
    private paused;
    private playing;
    private adStarted;
    private adSkipped;
    private adError;
    private adFinished;
    private playbackFinished;
    private stallStarted;
    private stallEnded;
    startPlaybackSession(): void;
}
