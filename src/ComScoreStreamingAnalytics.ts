import {
  PlayerAPI, PlaybackEvent, AdEvent, PlayerEventBase, LinearAd, AdBreakEvent,
} from 'bitmovin-player';
import { ComScoreConfiguration } from './ComScoreAnalytics';
import { ComScoreLogger } from './ComScoreLogger';

// Public

export class ComScoreStreamingAnalytics {
  private player: PlayerAPI;
  private streamingAnalytics: ns_.ReducedRequirementsStreamingAnalytics;
  private comScoreState: ComScoreState = ComScoreState.Stopped;
  private currentAd?: LinearAd;
  private metadata: ComScoreMetadata;
  private adBreakScheduleTime?: number;
  private logger: ComScoreLogger;
  private configuration: ComScoreConfiguration;
  private playerTransitioningState: PlayerTransitionState = PlayerTransitionState.Transitioned;
  private isMobile: boolean;

  constructor(player: PlayerAPI, metadata: ComScoreMetadata = { mediaType: ComScoreMediaType.Other },
              configuration: ComScoreConfiguration) {
    this.logger = new ComScoreLogger(configuration);
    if (!player) {
      console.error('player must not be null');
      return;
    }
    if (!metadata) {
      console.error('ComScoreMetadata must not be null');
      return;
    }

    // Defaults
    this.configuration = configuration;
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
    this.isMobile = !!navigator.userAgent && /Mobile/.test(navigator.userAgent);
    if (this.isMobile) {
      window.addEventListener('blur', this.blured);
    }
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
    this.player.off(this.player.exports.PlayerEvent.TimeChanged, this.timeChanged);
    this.metadata = null;
    this.player = null;
    this.streamingAnalytics = null;
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
    this.player.on(this.player.exports.PlayerEvent.StallStarted, this.stallStarted);
    this.player.on(this.player.exports.PlayerEvent.StallEnded, this.stallEnded);
    this.player.on(this.player.exports.PlayerEvent.AdBreakStarted, this.adBreakStarted);
    this.player.on(this.player.exports.PlayerEvent.TimeChanged, this.timeChanged);
  }

  private blured = () => {
    if (this.player.ads.isLinearAdActive()) {
      this.stopComScoreTrackingBackgroundAd();
      console.log('BLURED');
    }
  }

  private timeChanged = (event: PlaybackEvent) => {
    if ( ( this.playerTransitioningState === PlayerTransitionState.TransitioningToVideo ) && ( this.comScoreState !== ComScoreState.Video ) ) {
      let rawData = this.rawData(this.player.getDuration());
      this.streamingAnalytics.playVideoContentPart(rawData, this.contentType());
      this.comScoreState = ComScoreState.Video;
      this.logger.log('ComScoreStreamingAnalytics transitioned to Video - ' + JSON.stringify(rawData));
      this.playerTransitioningState = PlayerTransitionState.Transitioned;
    }
    if ( ( this.playerTransitioningState === PlayerTransitionState.TransitioningToAd ) && (this.comScoreState !== ComScoreState.Advertisement) ) {
      this.streamingAnalytics.playVideoAdvertisement({
        ns_st_cl: this.currentAd.duration * 1000,
        ns_st_ci: this.currentAd.id,
        ns_st_st: '*null',
        ns_st_ia: '*null',
        ns_st_ddt: '*null',
        ns_st_tdt: '*null',
      }, this.adType());
      this.comScoreState = ComScoreState.Advertisement;
      this.logger.log('ComScoreStreamingAnalytics transitioned to Ad');
      this.playerTransitioningState = PlayerTransitionState.Transitioned;
    }
  }

  private paused = (event: PlaybackEvent) => {
    if (! this.player.ads.isLinearAdActive()) {
      this.stopComScoreTracking();
    }
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
    this.transitionToVideo();
  }

  private playbackFinished = (event: PlayerEventBase) => {
    this.stopComScoreTracking();
    this.streamingAnalytics = null;
    new ComScoreStreamingAnalytics(this.player, this.metadata, this.configuration);
  }

  private stallStarted = (event: PlayerEventBase) => {
    this.stopComScoreTracking();
  }

  private stallEnded = (event: PlayerEventBase) => {
    this.transitionToVideo();
  }

  private stopComScoreTrackingBackgroundAd(): void {
    console.log(' DEBUG ComScoreStreamingAnalytics stopped active background Ad');
    if (this.comScoreState !== ComScoreState.Stopped) {
      this.streamingAnalytics.stop();
      this.logger.log('ComScoreStreamingAnalytics stopped active background Ad');
    }
  }

  private stopComScoreTracking(): void {
    if (this.comScoreState !== ComScoreState.Stopped) {
      this.streamingAnalytics.stop();
      this.comScoreState = ComScoreState.Stopped;
      this.logger.log('ComScoreStreamingAnalytics stopped');
    }
  }

  private transitionToAd(): void {
    if (this.comScoreState !== ComScoreState.Advertisement) {
      this.stopComScoreTracking();
      this.playerTransitioningState = PlayerTransitionState.TransitioningToAd;
    }
  }

  private transitionToVideo(): void {
    if (this.comScoreState !== ComScoreState.Video) {
      this.stopComScoreTracking();
      this.playerTransitioningState = PlayerTransitionState.TransitioningToVideo;
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

    var data = {
      ns_st_ci: this.metadata.uniqueContentId,
      ns_st_pu: this.metadata.publisherBrandName,
      ns_st_pr: this.metadata.programTitle,
      ns_st_tpr: this.metadata.programId,
      ns_st_ep: this.metadata.episodeTitle,
      ns_st_tep: this.metadata.episodeId,
      ns_st_sn: this.metadata.episodeSeasonNumber,
      ns_st_en: this.metadata.episodeNumber,
      ns_st_ge: this.metadata.contentGenre,
      ns_st_ddt: this.metadata.digitalAirdate ? this.metadata.digitalAirdate : '*null',
      ns_st_tdt: this.metadata.tvAirdate ? this.metadata.tvAirdate : '*null',
      ns_st_st: this.metadata.stationTitle ? this.metadata.stationTitle : '*null',
      c3: this.metadata.uniqueContentId,
      c4: this.metadata.uniqueContentId,
      c6: this.metadata.uniqueContentId,
      ns_st_ft: this.metadata.feedType,
      ns_st_ce: this.metadata.completeEpisode ? this.metadata.completeEpisode : '*null',
      ns_st_ia: this.metadata.advertisementLoad ? this.metadata.advertisementLoad : '*null',
      ns_st_cl: assetLength * 1000,
    };

    return data;
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

enum PlayerTransitionState {
  TransitioningToAd,
  TransitioningToVideo,
  Transitioned,
}

export class ComScoreMetadata {
  mediaType: ComScoreMediaType;
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
  c3?: string;
  c4?: string;
  c6?: string;
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
