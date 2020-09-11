import { ComScoreMetadata, ComScoreStreamingAnalytics } from './ComScoreStreamingAnalytics';
import { PlayerAPI } from 'bitmovin-player';
import { ComScoreLogger } from './ComScoreLogger';

export class ComScoreAnalytics {
  private static started: boolean = false;
  private static configuration: ComScoreConfiguration;
  private static logger: ComScoreLogger;
  private static analytics = ns_.analytics;

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

    if (typeof ns_ === 'undefined' || typeof this.analytics === 'undefined') {
      ComScoreLogger.error('ComScore script missing, cannot init ComScoreAnalytics');
      return;
    }

    if (!ComScoreAnalytics.started) {
      this.analytics.PlatformApi.setPlatformAPI(this.analytics.PlatformAPIs.html5);

      let publisherConfig = new this.analytics.configuration.PublisherConfiguration({
        'publisherId': configuration.publisherId,
        'persistentLabels': {
          'cs_ucfr': configuration.userConsent || '',
        },
      });
      this.analytics.configuration.addClient(publisherConfig);

      this.analytics.configuration.setApplicationName(configuration.applicationName);
      this.analytics.configuration.setApplicationVersion(configuration.applicationVersion);
    }

    if (configuration.childDirectedAppMode) {
      this.analytics.configuration.enableChildDirectedApplicationMode();
    }

    this.analytics.start();
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
    metadata: ComScoreMetadata = new ComScoreMetadata()): ComScoreStreamingAnalytics {
    if (!ComScoreAnalytics.started) {
      ComScoreLogger.error('ComScoreConfiguration must be started before you call createComScoreStreamingAnalytics');
      return;
    }
    ComScoreLogger.log('Creating ComScoreStreamingAnalytics');
    return new ComScoreStreamingAnalytics(player, metadata, this.configuration);
  }

  /**
   * Sets a Comscore application level label
   */
  public static setLabel(label: string, value: any) {
    if (ComScoreAnalytics.started) {
      this.analytics.configuration.setPersistentLabel(label, value);
      this.analytics.notifyHiddenEvent();
    }
  }

  /**
   * Sets  Comscore application level labels
   */
  public static setLabels(labels: any) {
    if (ComScoreAnalytics.started) {
      this.analytics.configuration.addPersistentLabels(labels);
      this.analytics.notifyHiddenEvent();
    }
  }

  /**
   * sets the userContent to granted. Use after the ComScoreAnalytics object has been started
   */
  public static userConsentGranted() {
    if (ComScoreAnalytics.started) {
      this.analytics.configuration.getPublisherConfiguration(this.configuration.publisherId).setPersistentLabel('cs_ucfr', '1');
      this.analytics.notifyHiddenEvent();
    }
  }

  /**
   * sets the userContent to denied. Use after the ComScoreAnalytics object has been started
   */
  public static userConsentDenied() {
    if (ComScoreAnalytics.started) {
      this.analytics.configuration.getPublisherConfiguration(this.configuration.publisherId).setPersistentLabel('cs_ucfr', '0');
      this.analytics.notifyHiddenEvent();
    }
  }

  /**
   * Call this method whenever your page enters the foreground
   */
  public static enterForeground() {
    if (this.configuration.isOTT) {
      ComScoreLogger.log('ComScoreAnalytics enterForeground');
      this.analytics.notifyEnterForeground();
    }
  }

  /**
   * Call this method whenever your page exits the foreground
   */
  public static exitForeground() {
    if (this.configuration.isOTT) {
      ComScoreLogger.log('ComScoreAnalytics exitForeground');
      this.analytics.notifyExitForeground;
    }
  }

}

export interface ComScoreConfiguration {
  /**
   * PublisherId assigned by ComScore (also known as c2 value)
   */
  publisherId: string;

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
   * value indicating the user's consent for ComScore tracking. Used for CCPA compliance
   */
  userConsent?: ComScoreUserConsent;

  /**
   * Toggles debug output for ComScoreAnalytics integration
   */
  debug: boolean;

  /**
   * Determines if the ChildDirectedApplicationMode setting should be enabled,
   * which limits collection of advertising data.
   */
  childDirectedAppMode: boolean;
}

/**
 * enum indicating whether the user has consented to ComScore analytics being sent
 */
export enum ComScoreUserConsent {
  Denied = '0',
  Granted = '1',
  Unknown = '-1',
}