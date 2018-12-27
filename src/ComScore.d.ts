declare namespace ns_ {
  class ReducedRequirementsStreamingAnalytics {
    playVideoContentPart(metadata: any, contentType: any);

    playVideoAdvertisement(metadata: any, contentType: any);

    stop(): void;
  }

  /* tslint:disable */
  class comScore {
    static setPlatformAPI(platform: PlatformAPIs): void;

    static setCustomerC2(publisherId: string): void;

    static setPublisherSecret(publisherSecret: string): void;

    static setAppName(appName: string): void;

    static setAppVersion(appVersion: string): void;

    static setAppContext(context: any): void;

    static onEnterForeground(): void;

    static onExitForeground(): void;

    static close(): void;
  }

  namespace ReducedRequirementsStreamingAnalytics {
    export enum AdType {
      LinearOnDemandPreRoll,
      LinearOnDemandMidRoll,
      LinearOnDemandPostRoll,
      LinearLive,
      BrandedOnDemandPreRoll,
      BrandedOnDemandMidRoll,
      BrandedOnDemandPostRoll,
      BrandedOnDemandContent,
      BrandedOnDemandLive,
      Other
    }

    export enum ContentType {
      LongFormOnDemand,
      ShortFormOnDemand,
      Live,
      UserGeneratedLongFormOnDemand,
      UserGeneratedShortFormOnDemand,
      UserGeneratedLive,
      Bumper,
      Other
    }
  }

  /* tslint:enable */

  enum PlatformAPIs {
    html5
  }
}

