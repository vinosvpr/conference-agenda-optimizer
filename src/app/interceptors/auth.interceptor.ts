import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('🌐 Interceptor Triggered:', req.url);

    // Example: get token from localStorage
    const token = localStorage.getItem('authToken');

    // Clone the request and add Authorization header if token exists
    const clonedReq = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

    // Pass request to next handler
    return next.handle(clonedReq);
  }
}
