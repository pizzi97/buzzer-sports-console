import { Component } from '@angular/core';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { HeaderComponent } from './layout/header/header';
import { SportsComponent } from './pages/sports/sports';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, SportsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {}
export { AppComponent as App };
