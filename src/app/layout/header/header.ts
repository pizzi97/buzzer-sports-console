import { Component, inject } from '@angular/core';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  searchService = inject(SearchService);

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchService.searchTerm.set(value);
  }
}
