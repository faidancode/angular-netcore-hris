import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideFile } from '@lucide/angular';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, LucideFile],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full text-center space-y-8">
        <div>
          <svg lucideFile [size]="96" class="mx-auto text-indigo-500" aria-hidden="true"></svg>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">404 - Not Found</h2>
          <p class="mt-2 text-sm text-gray-600">
            The page you are looking for doesn't exist or has been moved.
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
export class NotFoundComponent {
  protected readonly LucideFile = LucideFile;
}
