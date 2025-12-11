import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import {
  OnboardingService,
  OnboardingPayload,
} from '../services/onboarding.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-onboarding-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding-wizard.component.html',
  styleUrls: ['./onboarding-wizard.component.scss'],
})
export class OnboardingWizardComponent {
  form: FormGroup;
  currentStep = signal(1);
  totalSteps = 3;

  submitting = signal(false);
  apiError = signal<string | null>(null);
  apiSuccess = signal<string | null>(null);

  isLastStep = computed(() => this.currentStep() === this.totalSteps);
  isFirstStep = computed(() => this.currentStep() === 1);

  constructor(private fb: FormBuilder, private service: OnboardingService) {
    this.form = this.fb.group({
      personal: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
      }),
      address: this.fb.group({
        addressLine1: ['', Validators.required],
        city: ['', Validators.required],
        zip: ['', [Validators.required, Validators.minLength(6)]],
        country: ['', Validators.required],
      }),
      account: this.fb.group(
        {
          username: ['', [Validators.required, Validators.minLength(4)]],
          password: ['', [Validators.required, Validators.minLength(6)]],
          confirmPassword: ['', Validators.required],
          agree: [false, Validators.requiredTrue],
        },
        { validators: this.passwordsMatchValidator }
      ),
    });
  }

  // 🧠 Custom Validator (password match)
  private passwordsMatchValidator(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  // 🏆 SAFE GETTERS (prevents undefined errors)
  get personalGroup(): FormGroup {
    return this.form.get('personal') as FormGroup;
  }

  get addressGroup(): FormGroup {
    return this.form.get('address') as FormGroup;
  }

  get accountGroup(): FormGroup {
    return this.form.get('account') as FormGroup;
  }

  // 🔐 Step Wise Group Getter
  private getCurrentGroup(): FormGroup {
    switch (this.currentStep()) {
      case 1:
        return this.personalGroup;
      case 2:
        return this.addressGroup;
      case 3:
        return this.accountGroup;
      default:
        throw new Error('Invalid step!');
    }
  }

  nextStep() {
    const group = this.getCurrentGroup();
    if (group.invalid) {
      group.markAllAsTouched();
      return;
    }
    this.currentStep.update((s) => s + 1);
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  submit() {
    const group = this.getCurrentGroup();
    if (group.invalid) return group.markAllAsTouched();

    this.submitting.set(true);
    const payload: OnboardingPayload = this.form.value;

    this.service
      .submitOnboarding(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (res) => this.apiSuccess.set(`Success! User ID: ${res.userId}`),
        error: (err) => this.apiError.set(err.message || 'Error!'),
      });
  }

  // 🧾 Utility – Show Field Error
  hasError(group: FormGroup, control: string, error: string): boolean {
    const field = group.get(control);
    return !!(field && field.touched && field.hasError(error));
  }

  hasFormError(error: string): boolean {
    const group = this.accountGroup;
    return !!(group.touched && group.hasError(error));
  }
}
