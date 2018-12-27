import { ComScoreConfiguration } from './ComScoreAnalytics';

export class ComScoreLogger {
  private configuration: ComScoreConfiguration

  constructor(configuration: ComScoreConfiguration) {
    this.configuration = configuration
  }

  public log(message: string): void {
    if (typeof console === 'undefined') {
      return;
    }

    if (this.configuration.debug) {
      console.log(message);
    }
  }
}
