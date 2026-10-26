import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // <-- punta a app.ts (o App se la classe si chiama App)

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
