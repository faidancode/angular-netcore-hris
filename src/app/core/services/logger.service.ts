import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  log(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.log(`[LOG]: ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.info(`[INFO]: ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.warn(`[WARN]: ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    // Always log errors, even in production (could send to external service like Sentry)
    console.error(`[ERROR]: ${message}`, ...args);
  }
}
