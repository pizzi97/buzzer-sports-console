import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  isCollapsed = signal<boolean>(false);

  toggleCollapse(): void {
    this.isCollapsed.update((state) => !state);
  }
}
export { SidebarComponent as Sidebar };
