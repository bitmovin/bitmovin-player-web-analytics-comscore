"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ComScoreStreamingAnalytics_1 = require("./ComScoreStreamingAnalytics");
var ComScoreAnalytics_1 = require("./ComScoreAnalytics");
// Export Comscore ComScoreStreamingAnalytics to global namespace
var w = window;
w.bitmovin = w.bitmovin || {};
w.bitmovin.player = w.bitmovin.player || {};
w.bitmovin.player.analytics = w.bitmovin.player.analytics || {};
w.bitmovin.player.analytics.ComscoreStreamingAnalytics = ComScoreStreamingAnalytics_1.ComScoreStreamingAnalytics;
w.bitmovin.player.analytics.ComscoreAnalytics = ComScoreAnalytics_1.ComScoreAnalytics;
//# sourceMappingURL=index.js.map