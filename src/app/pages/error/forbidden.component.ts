import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideShieldAlert } from '@lucide/angular';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink, LucideShieldAlert],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full text-center space-y-8">
        <div>
          <svg lucideShieldAlert [size]="96" class="mx-auto text-red-500" aria-hidden="true"></svg>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">403 - Forbidden</h2>
          <p class="mt-2 text-sm text-gray-600">
            You do not have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>
        <div>
          <a routerLink="/dashboard" class="text-indigo-600 hover:text-indigo-500 font-medium" aria-label="Go back to dashboard">
            Go back to Dashboard
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ForbiddenComponent {
  protected readonly LucideShieldAlert = LucideShieldAlert;
}
