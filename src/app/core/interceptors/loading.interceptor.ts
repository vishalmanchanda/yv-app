import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../services/loader.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Don't show loader for some requests
    if (request.url.includes('/assets/') || request.url.includes('/config')) {
      return next.handle(request);
    }

    this.loaderService.show();

    return next.handle(request).pipe(
      finalize(() => {
        this.loaderService.hide();
      })
    );
  }
} 