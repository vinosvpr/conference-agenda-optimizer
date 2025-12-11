import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError, tap } from 'rxjs/operators';

export interface OnboardingPayload {
  personal: { firstName: string; lastName: string; email: string };
  address: {
    addressLine1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  account: { username: string };
}

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  constructor() {}
  submitOnboarding(payload: OnboardingPayload): Observable<any> {
    console.log('Sending to backend...', payload);
    if (payload.personal.email.includes('fail')) {
      return throwError(() => new Error('Email not allowed')).pipe(delay(1000));
    }
    // Replace with actual API call if needed
    return of({
      success: true,
      userId: Math.floor(Math.random() * 10000),
    }).pipe(
      delay(1500),
      tap(() => console.log('Success!'))
    );
  }
}
