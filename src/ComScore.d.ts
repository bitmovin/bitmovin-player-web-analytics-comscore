declare namespace ns_ {
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
        constructor({ }: any)
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

    class StreamingAnalytics {
      notifyPlay(): void;

      setMetadata(metadata: any): void;

      notifyPause(): void;

      constructor();
    }

    namespace StreamingAnalytics {
      namespace ContentMetadata {
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

      class ContentMetadata {
        setMediaType(type: StreamingAnalytics.ContentMetadata.ContentType): void;

        addCustomLabels(labels: any): void;

        constructor();
      }

      namespace AdvertisementMetadata {
        export enum AdvertisementType {
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
      }

      class AdvertisementMetadata {
        setMediaType(type: StreamingAnalytics.AdvertisementMetadata.AdvertisementType): void;

        addCustomLabels(labels: any): void;

        constructor();
      }
    }
  }
}

