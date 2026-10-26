import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../core/services/search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  protected searchService = inject(SearchService);

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchService.searchTerm.set(input.value);
  }

  onSearchInput(event: Event): void {
    this.onSearch(event);
  }
}

export { HeaderComponent as Header };
