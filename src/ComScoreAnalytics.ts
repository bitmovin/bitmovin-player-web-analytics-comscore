import { ComScoreMediaType, ComScoreMetadata, ComScoreStreamingAnalytics } from './ComScoreStreamingAnalytics';
import { PlayerAPI } from 'bitmovin-player';
import { ComScoreLogger } from './ComScoreLogger';

export class ComScoreAnalytics {
  private static started: boolean = false;
  private static configuration: ComScoreConfiguration;
  private static logger: ComScoreLogger;

  /**
   * Starts ComScore app tracking
   * @param configuration - Configuration object for your ComScore specific identifiers
   */
  public static start(configuration: ComScoreConfiguration) {

    if (configuration) {
      if (configuration.debug) {
        ComScoreLogger.enable();
      } else {
        ComScoreLogger.disable();
      }
    } else {
      console.error('ComScoreConfiguration must not be null');
      return;
    }

    ComScoreAnalytics.configuration = configuration;

    if (configuration.isOTT === true) {
      if (typeof ns_.comScore === 'undefined') {
        ComScoreLogger.error('ComScore script missing, cannot init ComScoreAnalytics. '
          + 'Please load the ComScore script (comscore.ott.1.5.0.170216.min.js) before Bitmovin\'s ComScore integration.');
        return;
      }

      if (!ComScoreAnalytics.started) {
        ns_.comScore.setPlatformAPI(ns_.PlatformAPIs.html5);
        ns_.comScore.setAppContext(this);
        ns_.comScore.setCustomerC2(configuration.publisherId);
        ns_.comScore.setPublisherSecret(configuration.publisherSecret);
        ns_.comScore.setAppName(configuration.applicationName);
        ns_.comScore.setAppVersion(configuration.applicationVersion);
      }
    }

    ComScoreAnalytics.started = true;
    ComScoreLogger.log('ComScoreAnalytics Started');
  }

  public static isActive(): boolean {
    return ComScoreAnalytics.started;
  }

  /**
   * Creates a ComScoreStreamingAnalytics object that is used for tracking video playback
   * @param player - Bitmovin Player to track
   * @param metadata - ComScoreMetadata for the source that will be loaded in the player
   */
  public static createComScoreStreamingAnalytics(player: PlayerAPI,
                                                 metadata: ComScoreMetadata = { mediaType: ComScoreMediaType.Other }): ComScoreStreamingAnalytics {
    if (!ComScoreAnalytics.started) {
      ComScoreLogger.error('ComScoreConfiguration must be started before you call createComScoreStreamingAnalytics');
      return;
    }
    ComScoreLogger.log('Creating ComScoreStreamingAnalytics');
    return new ComScoreStreamingAnalytics(player, metadata, this.configuration);
  }

  /**
   * Call this method whenever your page enters the foreground
   */
  public static enterForeground() {
    if (this.configuration.isOTT) {
      ComScoreLogger.log('ComScoreAnalytics enterForeground');
      ns_.comScore.onEnterForeground();
    }
  }

  /**
   * Call this method whenever your page exits the foreground
   */
  public static exitForeground() {
    if (this.configuration.isOTT) {
      ComScoreLogger.log('ComScoreAnalytics exitForeground');
      ns_.comScore.onExitForeground();
    }
  }

  /**
   * Call this method to close the current ComScoreTracking
   */
  public static close() {
    if (this.configuration.isOTT) {
      ComScoreLogger.log('ComScoreAnalytics close');
      ns_.comScore.close();
    }
  }
}

export interface ComScoreConfiguration {
  /**
   * PublisherId assigned by ComScore (also known as c2 value)
   */
  publisherId: string;

  /**
   * PublisherSecret assigned by ComScore
   */
  publisherSecret: string;

  /**
   * The name of your application that you want to be used for ComScore tracking
   */
  applicationName: string;

  /**
   * Application version number used for ComScore tracking
   */
  applicationVersion: string;

  /**
   * boolean indicating if the ComScore integration is being used in an OTT application.
   */
  isOTT: boolean;

  /**
   * Toggles debug output for ComScoreAnalytics integration
   */
  debug: boolean;

}