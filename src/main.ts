import { bootstrapApplication } from '@angular/platform-browser';
<<<<<<< HEAD
import { provideRouter, withComponentInputBinding, InMemoryScrollingOptions } from '@angular/router';
import { withInMemoryScrolling } from '@angular/router';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';

const scrollConfig: InMemoryScrollingOptions = {
  anchorScrolling: 'enabled',
  scrollPositionRestoration: 'enabled',
};

bootstrapApplication(AppComponent, appConfig).then(() => {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling(scrollConfig),
      withComponentInputBinding()
    ),
    provideHttpClient(
      withFetch()
    )
  ]
}).catch(err => console.error(err));
=======
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
>>>>>>> e7d2bd6c15dcee048b5229f3acdbf962bd52952a
