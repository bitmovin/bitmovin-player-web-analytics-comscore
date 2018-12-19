Bitmovin Video Player with the comScore Analytics integration

![Experimental Status](https://img.shields.io/badge/Project%20Stage-Experimental-yellow.svg)
[![NPM version](https://img.shields.io/npm/v/bitmovin-player.svg)](https://www.npmjs.com/package/bitmovin-player)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)


```js
var player = bitmovin.player('player');

var comscore = new bitmovin.player.analytics.ComscoreAnalytics(player, {
  clientId: 'COMSCORE_CLIENT_ID'
});

player.setup(/* Bitmovin Player Config */).then( function() {
  console.log('player with analytics is ready');
});
```


## NOTE FOR BITMOVIN

**This repo is not ready to be published.**

**comScore legal terms are not clear. Before publishing, we probably should remove compiled comscore sdk from the lib and pdf from doc folder**

## Installation

Via npm package (not yet published):
`npm install --save bitmovin-player-analytics-comscore`

or add `comscore-plugin.min.js` directly

```html
// Include a comScore SDK from your comScore dashboard before the bitmovin plugin

// Bitmovin CDN version
<script src="//bitmovin-a.akamaihd.net/bitmovin-analytics-comscore/stable/comscore-plugin.min.js"></script>

// or your own local copy
<script src="/local/path/comscore-plugin.min.js"></script>
```


## Usage

1. Install and package all the scripts or include them in this order:
  * Bitmovin Player
  * comScore SDK
  * Bitmovin comScore plugin
2. Setup basic analytics reporting

```js
    var playerConfig = {
      key: 'YOUR-PLAYER-KEY',
      source: {
        ...
      },
      ...
    };
    var player = new bitmovin.player.Player(document.getElementById('player'), playerConfig);

    // A Comscore instance is always tied to one player instance
    var comscore = new bitmovin.player.analytics.Comscore(player, {
      clientId: 'COMSCORE_CLIENT_ID'
    });

    player.load(source).then(function() {
      console.log('player source loaded');
    }, function(reason) {
      console.error('player setup failed', reason);
    });
```

 4. Add optional properties to the player's source configuration object to improve analytics data:

```js

 var comscore = new bitmovin.player.analytics.Comscore(player, {
  clientId: 'COMSCORE_CLIENT_ID',
  // Optional
  publisher: 'MGM',
  series: 'Joy of Coding',
  episode: 'S02E03'
});
```


## Development

Use either `make` or npm scripts. Use make to show all commands.


* `npm run build` - Build a minified, production version into a `/dist` folder
* `npm run develop` - Launch a dev server at port 9002
* `npm run test` - run node tests
* `npm run mock` - Launch a mock comScore endpoint at port 9050
* `npm run sandbox` - Launch a sanbox at port 9002 for testing production build from dist with sandbox html files

Templates are located in a `sandbox` folder. The idea is to have multiple use cases to test. And also a browser test runner in the future for CI.

Webpack configs and task runners are located in a `build` folder

## Acknowledgements

**Bitmovin comScore Plugin** © 2017+, Bitmovin Inc. Released under the [MIT] License.<br>
Authored and maintained by Bitmovin Inc. with help from contributors ([list][contributors]).

> [bitmovin.com](https://www.bitmovin.com/) &nbsp;&middot;&nbsp;
> GitHub [@bitmovin](https://github.com/bitmovin) &nbsp;&middot;&nbsp;

[MIT]: http://mit-license.org/
[contributors]: https://github.com/bitmovin/bitmovin-player-ui/contributors
