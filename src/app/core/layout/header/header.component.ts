import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { DropdownComponent } from '../menu/dropdown.component';
import { authService } from '../../auth/auth.service';
import { LucideAngularModule, Settings, UserCog, LogOut, Menu, Blinds, Sun, Moon, Monitor } from 'lucide-angular';
import { ThemeService } from '../../../../assets/styles/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, DropdownComponent, LucideAngularModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  @Output() openMobile = new EventEmitter<void>();
  @Output() toggleCollapse = new EventEmitter<void>();

  username = signal<string | null>(null);


  Menu = Menu; Settings = Settings; UserCog = UserCog; Blinds = Blinds; LogOut = LogOut;
  Sun = Sun; Moon = Moon; Monitor = Monitor;

  constructor(public theme: ThemeService) {} 

  ngOnInit(): void {
    void this.loadProfile();  // "void" para dejar claro que no esperas el Promise
  }

  private async loadProfile(): Promise<void> {
    try {
      const p = await authService.profile();
      this.username.set(p?.username ?? null);
    } catch (e) {
      // opcional: log o fallback
      this.username.set(null);
      console.error('No se pudo cargar el perfil', e);
    }
  }

  login() {
    authService.login();
  }
  logout() {
    authService.logout();
  }
  account() {
    authService.account();
  }
}
