import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
// import { provideRouter } from '@angular/router';
// import { routes } from './app/app.routes';
// import { provideZoneChangeDetection } from '@angular/core';

// import 'zone.js'; // Commented out to go zoneless

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
// bootstrapApplication(App, {
//     providers: [
//       provideRouter(routes),
//       // Configure to run without Zone.js
//       // provideZoneChangeDetection({ noop: true })
//     ],
//     ngZone: 'noop'
//   }).catch(err => console.error(err));
