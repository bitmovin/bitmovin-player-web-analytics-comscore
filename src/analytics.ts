import { Ad, Content } from './comscore-clip';
import {
  Player, PlayerAPI, PlaybackEvent, AdEvent, PlayerEventBase,
} from 'bitmovin-player';

// Public
declare var ns_: any;
declare var window: any;
declare type Player = PlayerAPI; // TODO use player API type definitions once available

export class Analytics {

  private player: Player;
  private tracker: any;
  private config: any;

  private sessionIsActive: boolean;
  private contentDefined: boolean;
  private isAd: boolean;

  private debug: boolean;
  private stub: number;

  constructor(player, config) {
    if (player == null) {
      throw new Error('No player reference');
    }
    if (config == null) {
      throw new Error('No config');
    }
    if (config.clientId == null) {
      throw new Error('Client ID must be provided');
    }

    // Defaults
    this.player = player;
    this.config = config;

    // Relate to comscore playlist mindset
    this.sessionIsActive = false;
    this.contentDefined = false;

    // TODO: Remove after initial DEV phase
    // @debug = config.debug || false
    this.debug = true;
    this.stub = 1212;
    this.isAd = false;

    // Only for debug and reverse engineering
    let c: any = {};
    if (this.debug && (config.alternativeUri != null)) {
      c = {
        liveEndpointURL: config.alternativeUri
      };
    } else {
      c = {
        publisherId: config.clientId,
        c4: 'https://testests.com'
      };
    }

    console.log('test5', c);
    this.tracker = new ns_.StreamingAnalytics(c);
    console.log('tracker', this.tracker);
    window._comscoreshit = this.tracker;
    this.registerCoreEvents();

    return this;
  }

  registerCoreEvents() {
    this.player.on(this.player.exports.PlayerEvent.Playing, this.playing)
    this.player.on(this.player.exports.PlayerEvent.Paused, this.paused)
    this.player.on(this.player.exports.PlayerEvent.PlaybackFinished, this.playbackFinished)
    this.player.on(this.player.exports.PlayerEvent.AdStarted, this.adStarted)
    this.player.on(this.player.exports.PlayerEvent.AdFinished, this.adFinished)
    this.player.on(this.player.exports.PlayerEvent.AdSkipped, this.adSkipped)
    this.player.on(this.player.exports.PlayerEvent.AdError, this.adError)
    this.player.on(this.player.exports.PlayerEvent.StallStarted, this.stallStarted)
    this.player.on(this.player.exports.PlayerEvent.StallEnded, this.stallEnded)
  }

  playbackHasStarted() {
    this.player.isPlaying() || !this.player.isPaused();
  }

  private paused = (event: PlaybackEvent) => {
    console.log('paused')
    console.log('time: ', this.player.getCurrentTime());
    this.tracker.notifyPause(this.player.getCurrentTime());
  }

  // - Define a content clip if it is appropriate
  private playing = (event: PlaybackEvent) => {
    console.log('playing')
    if (this.playbackHasStarted()) {
      if (!this.contentDefined && !this.isAd) {
        console.log('Defining content Clip');
        let conf = this.player.getConfig();
        let contentClip = new Content({
          // id: this.player.getSource().contentId || null,
          // name: conf.source.title || null,
          duration: (this.player.getDuration() * 1000) || 0,
          url: 'https://example.com/test.mp4'
        });

        this.tracker.getPlaybackSession().setAsset(contentClip.serialize());
        this.contentDefined = true;
      }
    }

    this.tracker.notifyPlay(this.player.getCurrentTime());
    if (!this.sessionIsActive) {
      this.startPlaybackSession();
    }
  }

  /*
  	- switch analytics into an AD mode
  	- register a new Clip with a Comscore SDK
  */
  private adStarted = (event: AdEvent) => {
    console.log('adStarted')
    this.isAd = true;

    // Configure ad and inspect ad type pre/mid/post
    // let ad = new Ad({
    //   id: 0,
    //   duration: event.ad * 1000
    // });
    // switch (event.timeOffset) {
    //   case 'pre':
    //     ad.setPre();
    //     break;
    //   case 'post':
    //     ad.setPost();
    //     break;
    //   default:
    //     ad.setMid();
    // }
    // this.tracker.getPlaybackSession().setAsset(ad.serialize());
  }

  private adSkipped = (event: AdEvent) => {
    console.log('adSkipped')
    this.adFinished(event);
  }

  private adError = (event) => {
    console.log('adError')
    this.adFinished(event);
  }

  private adFinished = (event: AdEvent) => {
    console.log('adFinished')
    this.isAd = false;
    this.tracker.notifyEnd(this.player.getCurrentTime());
  }

  private playbackFinished = (event: PlayerEventBase) => {
    console.log('playbackFinished')
    this.sessionIsActive = false;
  }

  private stallStarted = (event: PlayerEventBase) => {
    console.log('stallStarted')
    this.tracker.notifyBufferStart(this.player.getCurrentTime());
  }

  private stallEnded = (event: PlayerEventBase) => {
    console.log('stallEnded')
    this.tracker.notifyBufferStop(this.player.getCurrentTime());
  }

  /*
  	- If there is no active session, go make one
  */
  startPlaybackSession() {
    if (this.sessionIsActive === true) {
      throw new Error('Don\'t start another session before ending the last one');
    }
    this.tracker.createPlaybackSession();
    this.sessionIsActive = true;
  }

};
