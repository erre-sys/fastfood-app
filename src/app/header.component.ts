import { Component } from '@angular/core';
import { authService } from './core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
  <header style="padding:8px;border-bottom:1px solid #ddd;display:flex;gap:8px;align-items:center;">
    <strong>FastFood</strong>
    <span style="flex:1 1 auto"></span>
    <button (click)="refresh()">Refresh token</button>
    <button (click)="logout()">Logout</button>
  </header>
  `
})
export class HeaderComponent {
  async refresh(){ await authService.token(); }
  async logout(){ await authService.logout(); }
}
