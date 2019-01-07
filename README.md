Bitmovin Video Player with the ComScore Analytics integration

![Experimental Status](https://img.shields.io/badge/Project%20Stage-Experimental-yellow.svg)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

## Installation

Via npm package (not yet published):
`npm install --save bitmovin-player-analytics-comscore`

or add `bitmovinplayer-analytics-comscore.js` directly

```html
// Include a comScore SDK from your comScore dashboard before the bitmovin plugin

// Bitmovin CDN version
<script src="//bitmovin-a.akamaihd.net/bitmovin-analytics-comscore/stable/comscore-plugin.min.js"></script>

// or your own local copy
<script src="/local/path/comscore-plugin.min.js"></script>
```


## Usage

1. Setup basic analytics reporting

```js
  // Start ComScoreAnalytics app tracking
  bitmovin.player.analytics.ComScoreAnalytics.start({
    publisherId: 'YOUR_PUBLISHER_ID',
    publisherSecret: 'YOUR_PUBLISHER_SECRET',
    applicationName: 'YOUR_APPLICATION_NAME',
    applicationVersion: 'YOUR_APPLICATION_VERSION',
  });

  bitmovin.player.analytics.ComScoreAnalytics.enterForeground();

  // Create ComScoreStreamingAnalytics
  var comscoreStreamingAnalytics = bitmovin.player.analytics.ComScoreAnalytics.createComScoreStreamingAnalytics(player, {
      mediaType: bitmovin.player.analytics.LongFormOnDemand,
      publisherBrandName: 'ABC',
      programTitle: 'Modern Family',
      episodeTitle: 'Rash Decisions',
      episodeSeasonNumber: '01',
      episodeNumber: '2',
      contentGenre: 'Comedy',
      stationTitle: 'Hulu',
      completeEpisode: true,
    },
  );
  
  //Update metadata for your new source load
  comscoreStreamingAnalytics.updateMetadata({
        mediaType: bitmovin.player.analytics.LongFormOnDemand,
        publisherBrandName: 'ABC',
        programTitle: 'Modern Family',
        episodeTitle: 'Rash Decisions',
        episodeSeasonNumber: '01',
        episodeNumber: '2',
        contentGenre: 'Comedy',
        stationTitle: 'Hulu',
        completeEpisode: true,
  })
```


## Development

4. Run tasks:
  * `npm run lint` to lint TypeScript files
  * `npm run build` to build project into `dist` directory
  * `npm run start` to open test page in browser, build and reload changed files automatically

