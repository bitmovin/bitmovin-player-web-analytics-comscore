import { ComScoreConfiguration } from './ComScoreAnalytics';

export class ComScoreLogger {
  private static enabled: boolean;
  public static enable() {
    this.enabled = true;
  }
  public static disable() {
    this.enabled = false;
  }

  public static log(message: string): void {
    if (typeof console === 'undefined') {
      return;
    }

    if (this.enabled) {
      console.log(message);
    }
  }

  public static error(message: string): void {
    if (typeof console === 'undefined') {
      return;
    }

    if (this.enabled) {
      console.error(message);
    }
  }

  public static warn(message: string): void {
    if (typeof console === 'undefined') {
      return;
    }

    if (this.enabled) {
      console.warn(message);
    }
  }
}
