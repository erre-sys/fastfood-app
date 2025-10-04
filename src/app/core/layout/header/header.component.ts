import { Component, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { DropdownComponent } from "../menu/dropdown.component";
import { authService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, DropdownComponent],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  username = signal<string | null>(null);
  async ngOnInit(){ const p = await authService.profile(); this.username.set(p.username ?? null); }
  login(){ authService.login(); }
  logout(){ authService.logout(); }
  account(){ authService.account(); }
}
