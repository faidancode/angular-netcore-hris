// file: app/shared/components/button/button.component.ts

import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideArrowLeft, LucideLoader, LucideSave } from '@lucide/angular';

type ActionType = 'cancel' | 'save' | null;

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [CommonModule, LucideLoader, LucideArrowLeft, LucideSave],
  templateUrl: './icon-button.component.html',
  styles: [
    `
      :host {
        display: inline-block;
      }
      .animate-spin {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class IconButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  loading = input<boolean>(false);
  loadingText = input<string>('');
  disabled = input<boolean>(false);

  // 🔥 new
  actionType = input<ActionType>(null);
}
