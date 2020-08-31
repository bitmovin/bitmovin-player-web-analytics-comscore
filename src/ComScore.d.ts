declare namespace ns_ {
  class ReducedRequirementsStreamingAnalytics {
    playVideoContentPart(metadata: any, contentType: any);

    playVideoAdvertisement(metadata: any, contentType: any);

    stop(): void;

    constructor();
    constructor(configuration: any);
  }

  namespace analytics {
    namespace configuration {
      function setApplicationName(name: string): void;

      function setApplicationVersion(name: string): void;

      function addClient(config: PublisherConfiguration): void;

      function setPersistentLabel(name: string, value: any): void;

      function setPersistentLabels(labels: any);

      function enableImplementationValidationMode(): void;

      class PublisherConfiguration {
        publisherId: string;
        constructor({}: any)
      }
    }

    function setPlatformAPI(platform: PlatformAPIs): void;

    function setCustomerC2(publisherId: string): void;

    function setPublisherSecret(publisherSecret: string): void;

    function notifyHiddenEvent(): void;

    function notifyEnterForeground(): void;

    function notifyExitForeground(): void;

    function close(): void;

    function start(): void;

    namespace PlatformApi {
      function setPlatformAPI(platformApi: PlatformAPIs): void;
    }

    enum PlatformAPIs {
      html5,
    }
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
}

