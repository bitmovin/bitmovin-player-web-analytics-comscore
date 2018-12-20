import {
  PlayerAPI, PlaybackEvent, AdEvent, PlayerEventBase, LinearAd, AdBreakEvent,
} from 'bitmovin-player';
import { ComScoreConfiguration } from './ComScoreAnalytics';

// Public
declare var ns_: any;

export class ComScoreStreamingAnalytics {

  private player: PlayerAPI
  private streamingAnalytics: any
  private comScoreState: ComScoreState = ComScoreState.Stopped
  private currentAd?: LinearAd
  private metadata: ComScoreMetadata
  private adBreakScheduleTime?: number

  constructor(player: PlayerAPI, metadata: ComScoreMetadata = { mediaType: ComScoreMediaType.Other }) {
    if (player == null) {
      console.error('player must not be null')
      return
    }
    if (metadata == null) {
      console.error('ComScoreMetadata must not be null')
      return
    }

    // Defaults
    this.player = player
    this.metadata = metadata
    this.streamingAnalytics = new ns_.ReducedRequirementsStreamingAnalytics()
    this.registerPlayerEvents()

    return this
  }

  /**
   * Updates the ComScoreMetadata that is sent during tracking events. Use this when transitioning from one asset to
   * another
   * @param metadata
   */

  updateMetadata(metadata: ComScoreMetadata): void {
    this.metadata = metadata
  }

  private registerPlayerEvents(): void {
    this.player.on(this.player.exports.PlayerEvent.Playing, this.playing)
    this.player.on(this.player.exports.PlayerEvent.Paused, this.paused)
    this.player.on(this.player.exports.PlayerEvent.PlaybackFinished, this.playbackFinished)
    this.player.on(this.player.exports.PlayerEvent.AdStarted, this.adStarted)
    this.player.on(this.player.exports.PlayerEvent.AdFinished, this.adFinished)
    this.player.on(this.player.exports.PlayerEvent.AdSkipped, this.adSkipped)
    this.player.on(this.player.exports.PlayerEvent.AdError, this.adError)
    this.player.on(this.player.exports.PlayerEvent.StallStarted, this.stallStarted)
    this.player.on(this.player.exports.PlayerEvent.StallEnded, this.stallEnded)
    this.player.on(this.player.exports.PlayerEvent.AdBreakStarted, this.adBreakStarted)
  }

  private paused = (event: PlaybackEvent) => {
    console.log('paused')
    this.stopComScoreTracking()
  }

  private playing = (event: PlaybackEvent) => {
    if (this.player.ads.isLinearAdActive()) {
      this.transitionToAd()
    } else {
      this.transitionToVideo()
    }
  }

  private adStarted = (event: AdEvent) => {
    console.log('adStarted')
    if (event.ad.isLinear) {
      this.currentAd = event.ad as LinearAd
      this.transitionToAd()
    }
  }

  private adBreakStarted = (event: AdBreakEvent) => {
    console.log('adBreakStarted')
    this.adBreakScheduleTime = event.adBreak.scheduleTime
  }

  private adSkipped = (event: AdEvent) => {
    console.log('adSkipped')
    this.adFinished(event)
  }

  private adError = (event) => {
    console.log('adError')
    this.adFinished(event)
  }

  private adFinished = (event: AdEvent) => {
    console.log('adFinished')
    this.transitionToVideo()
  }

  private playbackFinished = (event: PlayerEventBase) => {
    console.log('adFinished')
    this.stopComScoreTracking()
  }

  private stallStarted = (event: PlayerEventBase) => {
    console.log('adFinished')
    this.stopComScoreTracking()
  }

  private stallEnded = (event: PlayerEventBase) => {
    console.log('adFinished')
    this.transitionToVideo()
  }

  private stopComScoreTracking(): void {
    if (this.comScoreState !== ComScoreState.Stopped) {
      this.streamingAnalytics.stop()
      this.comScoreState = ComScoreState.Stopped
    }
  }

  private transitionToAd(): void {
    if (this.comScoreState !== ComScoreState.Advertisement) {
      this.stopComScoreTracking()
      this.streamingAnalytics.playVideoAdvertisement({
        ns_st_cl: this.currentAd.duration,
      }, this.adType())
      this.comScoreState = ComScoreState.Advertisement
    }
  }

  private transitionToVideo(): void {
    if (this.comScoreState !== ComScoreState.Video) {
      this.stopComScoreTracking()
      let rawData = this.rawData(this.player.getDuration())
      console.log(rawData)
      this.streamingAnalytics.playVideoContentPart(rawData, this.contentType())
      this.comScoreState = ComScoreState.Video
    }
  }

  private adType(): any {
    if (this.player.isLive) {
      return ns_.ReducedRequirementsStreamingAnalytics.AdType.LinearOnDemandMidRoll
    } else {
      if (this.currentAd) {
        if (this.adBreakScheduleTime === 0) {
          return ns_.ReducedRequirementsStreamingAnalytics.AdType.LinearOnDemandPreRoll
        } else if (this.adBreakScheduleTime === this.player.getDuration()) {
          return ns_.ReducedRequirementsStreamingAnalytics.AdType.LinearOnDemandPostRoll
        } else {
          return ns_.ReducedRequirementsStreamingAnalytics.AdType.LinearOnDemandMidRoll
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
      ns_st_ddt: this.metadata.digitalAirdate,
      ns_st_tdt: this.metadata.tvAirdate,
      ns_st_st: this.metadata.stationTitle,
      c3: this.metadata.uniqueContentId,
      c4: this.metadata.uniqueContentId,
      c6: this.metadata.uniqueContentId,
      ns_st_ft: this.metadata.feedType,
      ns_st_ce: this.metadata.completeEpisode ? '1' : null,
      ns_st_ia: this.metadata.advertisementLoad ? '1' : null,
      ns_st_cl: assetLength * 1000,
    }

    return data
  }

  private contentType(): any {
    switch (this.metadata.mediaType) {
      case ComScoreMediaType.LongFormOnDemand:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.LongFormOnDemand
      case ComScoreMediaType.ShortFormOnDemand:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.ShortFormOnDemand
      case ComScoreMediaType.Live:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.Live
      case ComScoreMediaType.UserGeneratedLongFormOnDemand:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.UserGeneratedLongFormOnDemand
      case ComScoreMediaType.UserGeneratedShortFormOnDemand:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.UserGeneratedShortFormOnDemand
      case ComScoreMediaType.UserGeneratedLive:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.UserGeneratedLive
      case ComScoreMediaType.Bumper:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.Bumper
      case ComScoreMediaType.Other:
        return ns_.ReducedRequirementsStreamingAnalytics.ContentType.Other
    }
  }
};

enum ComScoreState {
  Stopped,
  Video,
  Advertisement
}

export class ComScoreMetadata {
  mediaType: ComScoreMediaType
  uniqueContentId?: string
  publisherBrandName?: string
  programTitle?: string
  programId?: string
  episodeTitle?: string
  episodeId?: string
  episodeSeasonNumber?: string
  episodeNumber?: string
  contentGenre?: string
  advertisementLoad?: boolean
  digitalAirdate?: string
  tvAirdate?: string
  stationTitle?: string
  c3?: string
  c4?: string
  c6?: string
  completeEpisode?: boolean
  feedType?: string
}

export enum ComScoreMediaType {
  LongFormOnDemand,
  ShortFormOnDemand,
  Live,
  UserGeneratedLongFormOnDemand,
  UserGeneratedShortFormOnDemand,
  UserGeneratedLive,
  Bumper,
  Other
}
