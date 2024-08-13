import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

const routes: Routes = [
  // إضافة مسارات هنا
];

export const appConfig = {
  providers: [
    provideHttpClient(), // تضمين HttpClientModule
    provideRouter(routes) // تضمين المسارات إذا كان لديك
  ],
};
