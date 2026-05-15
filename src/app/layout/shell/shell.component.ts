import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideLogOut, LucideMenu, LucideUser } from '@lucide/angular';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, LucideMenu, LucideUser, LucideLogOut],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  auth = inject(AuthService);
  isCollapsed = signal(false);
  isDropdownOpen = signal(false);

  user = this.auth.currentUser;
  initials = computed(
    () =>
      this.user()
        ?.name?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? 'HR',
  );

  protected readonly LucideMenu = LucideMenu;

  toggleDropdown() {
    this.isDropdownOpen.update((v) => !v);
  }

  logout() {
    this.auth.logout();
  }
}
