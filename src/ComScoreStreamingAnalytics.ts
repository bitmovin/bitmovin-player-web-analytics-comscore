import { AdBreakEvent, AdEvent, LinearAd, PlaybackEvent, PlayerAPI, PlayerEventBase } from 'bitmovin-player';
import { ComScoreConfiguration, ComScoreUserConsent } from './ComScoreAnalytics';
import { ComScoreLogger } from './ComScoreLogger';
import stringify from 'fast-safe-stringify';

// Public

export class ComScoreStreamingAnalytics {
  private player: PlayerAPI;
  private streamingAnalytics: ns_.ReducedRequirementsStreamingAnalytics;
  private comScoreState: ComScoreState = ComScoreState.Stopped;
  private currentAd?: LinearAd;
  private metadata: ComScoreMetadata;
  private adBreakScheduleTime?: number;
  private logger: ComScoreLogger;
  private userConsent: ComScoreUserConsent = ComScoreUserConsent.Unknown;

  constructor(player: PlayerAPI, metadata: ComScoreMetadata = new ComScoreMetadata(),
              configuration: ComScoreConfiguration) {

    if (configuration) {
      if (configuration.debug === true) {
        ComScoreLogger.enable();
      } else {
        ComScoreLogger.disable();
      }
    }

    if (!player) {
      ComScoreLogger.error('player must not be null');
      return;
    }
    if (!metadata) {
      ComScoreLogger.error('ComScoreMetadata must not be null');
      return;
    }

    if (configuration.userConsent !== undefined) {
      this.userConsent = configuration.userConsent;
    }

    // Defaults
    this.player = player;
    this.metadata = metadata;
    if (configuration.isOTT) {
      this.streamingAnalytics = new ns_.ReducedRequirementsStreamingAnalytics();
    } else {
      this.streamingAnalytics = new ns_.ReducedRequirementsStreamingAnalytics({
        publisherId: configuration.publisherId,
      });

    }
    this.registerPlayerEvents();

    return this;
  }

  /**
   * Updates the ComScoreMetadata that is sent during tracking events. Use this when transitioning from one asset to
   * another
   * @param metadata
   */
  updateMetadata(metadata: ComScoreMetadata): void {
    this.metadata = metadata;
  }

  /**
   * sets the userContent to granted. Use after the ComScoreAnalytics object has been started
   */
  public userConsentGranted() {
    this.userConsent = ComScoreUserConsent.Granted;
  }

  /**
   * sets the userContent to denied. Use after the ComScoreAnalytics object has been started
   */
  public userConsentDenied() {
    this.userConsent = ComScoreUserConsent.Denied;
  }

  destroy(): void {
    this.player.off(this.player.exports.PlayerEvent.Playing, this.playing);
    this.player.off(this.player.exports.PlayerEvent.Paused, this.paused);
    this.player.off(this.player.exports.PlayerEvent.SourceUnloaded, this.unloaded);
    this.player.off(this.player.exports.PlayerEvent.PlaybackFinished, this.playbackFinished);
    this.player.off(this.player.exports.PlayerEvent.AdStarted, this.adStarted);
    this.player.off(this.player.exports.PlayerEvent.AdFinished, this.adFinished);
    this.player.off(this.player.exports.PlayerEvent.AdSkipped, this.adSkipped);
    this.player.off(this.player.exports.PlayerEvent.AdError, this.adError);
    this.player.off(this.player.exports.PlayerEvent.StallStarted, this.stallStarted);
    this.player.off(this.player.exports.PlayerEvent.StallEnded, this.stallEnded);
    this.player.off(this.player.exports.PlayerEvent.AdBreakStarted, this.adBreakStarted);
    this.metadata = null;
    this.player = null;
    this.streamingAnalytics = null;
    this.userConsent = ComScoreUserConsent.Unknown;
  }

  private registerPlayerEvents(): void {
    this.player.on(this.player.exports.PlayerEvent.Playing, this.playing);
    this.player.on(this.player.exports.PlayerEvent.Paused, this.paused);
    this.player.on(this.player.exports.PlayerEvent.SourceUnloaded, this.unloaded);
    this.player.on(this.player.exports.PlayerEvent.PlaybackFinished, this.playbackFinished);
    this.player.on(this.player.exports.PlayerEvent.AdStarted, this.adStarted);
    this.player.on(this.player.exports.PlayerEvent.AdFinished, this.adFinished);
    this.player.on(this.player.exports.PlayerEvent.AdSkipped, this.adSkipped);
    this.player.on(this.player.exports.PlayerEvent.AdError, this.adError);
    this.player.on(this.player.exports.PlayerEvent.AdBreakFinished, this.adBreakFinished);
    this.player.on(this.player.exports.PlayerEvent.StallStarted, this.stallStarted);
    this.player.on(this.player.exports.PlayerEvent.StallEnded, this.stallEnded);
    this.player.on(this.player.exports.PlayerEvent.AdBreakStarted, this.adBreakStarted);
  }

  private paused = (event: PlaybackEvent) => {
    this.stopComScoreTracking();
  }

  private unloaded = (event: PlaybackEvent) => {
    this.stopComScoreTracking();
  }

  private playing = (event: PlaybackEvent) => {
    if (this.player.ads.isLinearAdActive()) {
      this.transitionToAd();
    } else {
      this.transitionToVideo();
    }
  }

  private adStarted = (event: AdEvent) => {
    if (event.ad.isLinear) {
      this.currentAd = event.ad as LinearAd;
      this.transitionToAd();
    }
  }

  private adBreakStarted = (event: AdBreakEvent) => {
    this.adBreakScheduleTime = event.adBreak.scheduleTime;
  }

  private adSkipped = (event: AdEvent) => {
    this.adFinished(event);
  }

  private adError = (event) => {
    if (this.currentAd) {
      this.adFinished(event);
    }
  }

  private adFinished = (event: AdEvent) => {
    this.stopComScoreTracking();
  }

  private adBreakFinished = (event: AdEvent) => {
    this.transitionToVideo();
  }

  private playbackFinished = (event: PlayerEventBase) => {
    this.stopComScoreTracking();
  }

  private stallStarted = (event: PlayerEventBase) => {
    this.stopComScoreTracking();
  }

  private stallEnded = (event: PlayerEventBase) => {
    this.transitionToVideo();
  }

  private stopComScoreTracking(): void {
    if (this.comScoreState !== ComScoreState.Stopped) {
      this.streamingAnalytics.stop();
      this.comScoreState = ComScoreState.Stopped;
      ComScoreLogger.log('ComScoreStreamingAnalytics stopped');
    }
  }

  private transitionToAd(): void {
    if (this.comScoreState !== ComScoreState.Advertisement) {
      this.stopComScoreTracking();
      const metadata: any = { ns_st_cl: Math.round(this.currentAd.duration * 1000)};
      this.decorateUserConsent(metadata);
      this.streamingAnalytics.playVideoAdvertisement(metadata, this.adType());
      this.comScoreState = ComScoreState.Advertisement;
      ComScoreLogger.log('ComScoreStreamingAnalytics transitioned to Ad');
    }
  }

  private transitionToVideo(): void {
    if (this.comScoreState !== ComScoreState.Video) {
      this.stopComScoreTracking();
      let rawData = this.rawData(this.player.getDuration());
      this.streamingAnalytics.playVideoContentPart(rawData, this.contentType());
      this.comScoreState = ComScoreState.Video;
      ComScoreLogger.log('ComScoreStreamingAnalytics transitioned to Video - ' + stringify(rawData));
    }
  }

  private adType(): ns_.ReducedRequirementsStreamingAnalytics.AdType {
    if (this.player.isLive()) {
      return ns_.ReducedRequirementsStreamingAnalytics.AdType.LinearLive;
    } else {
      if (this.currentAd) {
        if (this.adBreakScheduleTime === 0) {
          return ns_.ReducedRequirementsStreamingAnalytics.AdType.LinearOnDemandPreRoll;
        } else if (this.adBreakScheduleTime === this.player.getDuration()) {
          return ns_.ReducedRequirementsStreamingAnalytics.AdType.LinearOnDemandPostRoll;
        } else {
          return ns_.ReducedRequirementsStreamingAnalytics.AdType.LinearOnDemandMidRoll;
        }
      }
    }
  }

  private rawData(assetLength: number): any {
    let contentLength = Math.round(assetLength * 1000);
    if (contentLength === Infinity) {
      contentLength = 0;
    }

    var data: any = {
      ns_st_ci: this.metadata.uniqueContentId,
      ns_st_pu: this.metadata.publisherBrandName,
      ns_st_pr: this.metadata.programTitle,
      ns_st_tpr: this.metadata.programId,
      ns_st_ep: this.metadata.episodeTitle,
      ns_st_tep: this.metadata.episodeId,
      ns_st_sn: this.metadata.episodeSeasonNumber,
      ns_st_en: this.metadata.episodeNumber,
      ns_st_ge: this.metadata.contentGenre,
      ns_st_ddt: this.metadata.digitalAirdate,
      ns_st_tdt: this.metadata.tvAirdate,
      ns_st_st: this.metadata.stationTitle,
      c3: this.metadata.c3,
      c4: this.metadata.c4,
      c6: this.metadata.c6,
      ns_st_ft: this.metadata.feedType,
      ns_st_ce: this.metadata.completeEpisode ? '1' : null,
      ns_st_ia: this.metadata.advertisementLoad ? '1' : null,
      ns_st_cl: contentLength,
    };
    this.decorateUserConsent(data);
    return data;
  }

  private decorateUserConsent(metadata: any): void {
    switch (this.userConsent) {
      case ComScoreUserConsent.Denied: {
        metadata.cs_ucfr = '0';
        break;
      }
      case ComScoreUserConsent.Granted: {
        metadata.cs_ucfr = '1';
        break;
      }
    }
  }

  private contentType(): ns_.ReducedRequirementsStreamingAnalytics.ContentType {
    switch (this.metadata.mediaType) {
      case ComScoreMediaType.LongFormOnDemand:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.LongFormOnDemand;
      case ComScoreMediaType.ShortFormOnDemand:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.ShortFormOnDemand;
      case ComScoreMediaType.Live:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.Live;
      case ComScoreMediaType.UserGeneratedLongFormOnDemand:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.UserGeneratedLongFormOnDemand;
      case ComScoreMediaType.UserGeneratedShortFormOnDemand:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.UserGeneratedShortFormOnDemand;
      case ComScoreMediaType.UserGeneratedLive:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.UserGeneratedLive;
      case ComScoreMediaType.Bumper:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.Bumper;
      case ComScoreMediaType.Other:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.Other;
    }
  }
}

enum ComScoreState {
  Stopped,
  Video,
  Advertisement,
}

export class ComScoreMetadata {
  mediaType: ComScoreMediaType = ComScoreMediaType.Other;
  uniqueContentId?: string;
  publisherBrandName?: string;
  programTitle?: string;
  programId?: string;
  episodeTitle?: string;
  episodeId?: string;
  episodeSeasonNumber?: string;
  episodeNumber?: string;
  contentGenre?: string;
  advertisementLoad?: boolean;
  digitalAirdate?: string;
  tvAirdate?: string;
  stationTitle?: string;
  c3: string = '*null';
  c4: string = '*null';
  c6: string = '*null';
  completeEpisode?: boolean;
  feedType?: string;
}

export enum ComScoreMediaType {
  LongFormOnDemand,
  ShortFormOnDemand,
  Live,
  UserGeneratedLongFormOnDemand,
  UserGeneratedShortFormOnDemand,
  UserGeneratedLive,
  Bumper,
  Other,
}
