# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.2.3]
### Added
- Flag to enable/disable ComScore Ad Analytics Tracking

# [1.2.2]
## Fixed
- Update type definitions for both `AdvertisementMetadata.AdvertisementType` and `ContentMetadata.ContentType`. 

# [1.2.1]
## Changed
- Call configuration methods in `ComScoreAnalytics` regardless of the `isOTT` setting, per new integration guidelines. 

## [1.2.0]
## Changed
- Upgrade Comscore SDK support to version `7.5.0.200713`, per guidelines from migration document. 
## Added
- `childDirectedAppMode` configuration option. 

## [1.1.4]
### Added
- Expose `setLabel()` and `setLabels()` methods on `ComScoreAnalytics`.

[1.2.2]: https://github.com/bitmovin/bitmovin-player-analytics-comscore/compare/1.2.1...1.2.2
[1.2.1]: https://github.com/bitmovin/bitmovin-player-analytics-comscore/compare/1.2.0...1.2.1
[1.2.0]: https://github.com/bitmovin/bitmovin-player-analytics-comscore/compare/1.1.4...1.2.0
[1.1.4]: https://github.com/bitmovin/bitmovin-player-analytics-comscore/compare/1.1.3...1.1.4
