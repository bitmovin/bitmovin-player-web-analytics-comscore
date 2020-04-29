declare namespace ns_ {
  class ReducedRequirementsStreamingAnalytics {
    playVideoContentPart(metadata: any, contentType: any);

    playVideoAdvertisement(metadata: any, contentType: any);

    stop(): void;

    constructor();
    constructor(configuration: any);
  }

  namespace comScore {
    function setPlatformAPI(platform: PlatformAPIs): void;

    function setCustomerC2(publisherId: string): void;

    function setPublisherSecret(publisherSecret: string): void;

    function setAppName(appName: string): void;

    function setAppVersion(appVersion: string): void;

    function setLabel(label: any, value: any): void;

    function setLabels(labels: any): void;

    function hidden(): void;

    function setAppContext(context: any): void;

    function onEnterForeground(): void;

    function onExitForeground(): void;

    function close(): void;
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
      Other,
    }

    export enum ContentType {
      LongFormOnDemand,
      ShortFormOnDemand,
      Live,
      UserGeneratedLongFormOnDemand,
      UserGeneratedShortFormOnDemand,
      UserGeneratedLive,
      Bumper,
      Other,
    }
  }

  /* tslint:enable */

  enum PlatformAPIs {
    html5,
  }
}

