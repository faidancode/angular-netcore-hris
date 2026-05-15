import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import {
  LucideZap,
  LucideCircleAlert,
  LucideMail,
  LucideLock,
  LucideArrowRight,
  LucideShieldCheck,
  LucideContactRound,
} from '@lucide/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    LucideZap,
    LucideCircleAlert,
    LucideMail,
    LucideLock,
    LucideArrowRight,
    LucideContactRound,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  private auth = inject(AuthService);
  private router = inject(Router);

  protected readonly LucideZap = LucideZap;
  protected readonly LucideCircleAlert = LucideCircleAlert;
  protected readonly LucideMail = LucideMail;
  protected readonly LucideLock = LucideLock;
  protected readonly LucideArrowRight = LucideArrowRight;
  protected readonly LucideShieldCheck = LucideShieldCheck;

  onLogin() {
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Invalid credentials. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
