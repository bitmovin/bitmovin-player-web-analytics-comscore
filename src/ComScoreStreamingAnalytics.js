"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var comscore_clip_1 = require("./comscore-clip");
var ComScoreStreamingAnalytics = /** @class */ (function () {
    function ComScoreStreamingAnalytics(player, config) {
        var _this = this;
        this.paused = function (event) {
            console.log('paused');
            console.log('time: ', _this.player.getCurrentTime());
            _this.tracker.notifyPause(_this.player.getCurrentTime());
        };
        // - Define a content clip if it is appropriate
        this.playing = function (event) {
            console.log('playing');
            if (_this.playbackHasStarted()) {
                if (!_this.contentDefined && !_this.isAd) {
                    console.log('Defining content Clip');
                    var conf = _this.player.getConfig();
                    var contentClip = new comscore_clip_1.Content({
                        // id: this.player.getSource().contentId || null,
                        // name: conf.source.title || null,
                        duration: (_this.player.getDuration() * 1000) || 0,
                        url: 'https://example.com/test.mp4'
                    });
                    _this.tracker.getPlaybackSession().setAsset(contentClip.serialize());
                    _this.contentDefined = true;
                }
            }
            _this.tracker.notifyPlay(_this.player.getCurrentTime());
            if (!_this.sessionIsActive) {
                _this.startPlaybackSession();
            }
        };
        /*
          - switch analytics into an AD mode
          - register a new Clip with a Comscore SDK
        */
        this.adStarted = function (event) {
            console.log('adStarted');
            _this.isAd = true;
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
        };
        this.adSkipped = function (event) {
            console.log('adSkipped');
            _this.adFinished(event);
        };
        this.adError = function (event) {
            console.log('adError');
            _this.adFinished(event);
        };
        this.adFinished = function (event) {
            console.log('adFinished');
            _this.isAd = false;
            _this.tracker.notifyEnd(_this.player.getCurrentTime());
        };
        this.playbackFinished = function (event) {
            console.log('playbackFinished');
            _this.sessionIsActive = false;
        };
        this.stallStarted = function (event) {
            console.log('stallStarted');
            _this.tracker.notifyBufferStart(_this.player.getCurrentTime());
        };
        this.stallEnded = function (event) {
            console.log('stallEnded');
            _this.tracker.notifyBufferStop(_this.player.getCurrentTime());
        };
        if (player == null) {
            throw new Error('No player reference');
        }
        if (config == null) {
            throw new Error('No config');
        }
        // Defaults
        this.player = player;
        this.config = config;
        // Relate to comscore playlist mindset
        this.sessionIsActive = false;
        this.contentDefined = false;
        this.debug = config.debug;
        this.isAd = false;
        // Only for debug and reverse engineering
        var c = {};
        c = {
            publisherId: config.clientId
        };
        this.tracker = new ns_.StreamingAnalytics(c);
        console.log('tracker', this.tracker);
        window._comscoretracker = this.tracker;
        this.registerPlayerEvents();
        return this;
    }
    ComScoreStreamingAnalytics.prototype.registerPlayerEvents = function () {
        this.player.on(this.player.exports.PlayerEvent.Playing, this.playing);
        this.player.on(this.player.exports.PlayerEvent.Paused, this.paused);
        this.player.on(this.player.exports.PlayerEvent.PlaybackFinished, this.playbackFinished);
        this.player.on(this.player.exports.PlayerEvent.AdStarted, this.adStarted);
        this.player.on(this.player.exports.PlayerEvent.AdFinished, this.adFinished);
        this.player.on(this.player.exports.PlayerEvent.AdSkipped, this.adSkipped);
        this.player.on(this.player.exports.PlayerEvent.AdError, this.adError);
        this.player.on(this.player.exports.PlayerEvent.StallStarted, this.stallStarted);
        this.player.on(this.player.exports.PlayerEvent.StallEnded, this.stallEnded);
    };
    ComScoreStreamingAnalytics.prototype.playbackHasStarted = function () {
        this.player.isPlaying() || !this.player.isPaused();
    };
    /*
      - If there is no active session, go make one
    */
    ComScoreStreamingAnalytics.prototype.startPlaybackSession = function () {
        if (this.sessionIsActive === true) {
            throw new Error('Don\'t start another session before ending the last one');
        }
        this.tracker.createPlaybackSession();
        this.sessionIsActive = true;
    };
    return ComScoreStreamingAnalytics;
}());
exports.ComScoreStreamingAnalytics = ComScoreStreamingAnalytics;
;
//# sourceMappingURL=comScoreStreamingAnalytics.js.map