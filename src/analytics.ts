import { Ad, Content } from './comscore-clip';

// Public
declare var ns_: any;
declare var window: any;
declare type PlayerType = any; // TODO use player API type definitions once available


export class Analytics {

  private player: PlayerType;
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
    let coreEvents = [
    'onReady', 'onPlay', 'onPaused',
    'onPlaybackFinished', 'onSourceLoaded', 'onSourceUnloaded', 'onTimeChanged',
    'onSeek', 'onSeeked', 'onError', 'onAdStarted', 'onAdFinished', 'onAdSkipped', 'onAdError',
    'onStallStarted', 'onStallEnded'];

    // TODO: Remove when dev is done
    coreEvents.forEach((name) => {
      if (typeof this[name] === 'function') {
        this.player.addEventHandler(name, (payload) => {
          if (this.debug) {
            console.log(`${name}: `, payload);
          }
          this[name].apply(this, [payload]);
        });
      }
    });
  }

  playbackHasStarted() {
    this.player.isPlaying() || !this.player.isPaused();
  }

  onPaused(payload) {
    console.log('time: ', this.player.getCurrentTime());
    this.tracker.notifyPause(this.player.getCurrentTime());
  }

  // - Define a content clip if it is appropriate
  onPlay(payload) {
    if (this.playbackHasStarted()) {
      if (!this.contentDefined && !this.isAd) {
        console.log('Defining content Clip');
        let conf = this.player.getConfig();
        let contentClip = new Content({
          id: conf.source.contentId || null,
          name: conf.source.title || null,
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
  onAdStarted(e) {
    this.isAd = true;

    // Configure ad and inspect ad type pre/mid/post
    let ad = new Ad({
      id: 0,
      duration: e.duration * 1000
    });
    switch (e.timeOffset) {
      case 'pre':
        ad.setPre();
        break;
      case 'post':
        ad.setPost();
        break;
      default:
        ad.setMid();
    }
    this.tracker.getPlaybackSession().setAsset(ad.serialize());
  }

  onAdSkipped(e) {
    this.onAdFinished(e);
  }

  onAdError(e) {
    this.onAdFinished(e);
  }

  onAdFinished(e) {
    this.isAd = false;
    this.tracker.notifyEnd(this.player.getCurrentTime());
  }

  /*
  	- If there is no active session, go make one
  */
  onPlaybackFinished(e) {
    this.sessionIsActive = false;
  }

  startPlaybackSession() {
    if (this.sessionIsActive === true) {
      throw new Error('Don\'t start another session before ending the last one');
    }
    this.tracker.createPlaybackSession();
    this.sessionIsActive = true;
  }

  onStallStarted(e) {
    this.tracker.notifyBufferStart(this.player.getCurrentTime());
  }

  onStallEnded(e) {
    this.tracker.notifyBufferStop(this.player.getCurrentTime());
  }

};
