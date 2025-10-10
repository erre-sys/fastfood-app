import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { DropdownComponent } from '../menu/dropdown.component';
import { authService } from '../../auth/auth.service';

import {
  Settings,
  UserCog,
  LucideAngularModule,
  LogOut,
  Menu, Blinds
} from 'lucide-angular';

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

  Menu = Menu;
  Settings = Settings;
  UserCog = UserCog;
  Blinds = Blinds;
  LogOut = LogOut;

  async ngOnInit() {
    const p = await authService.profile();
    this.username.set(p.username ?? null);
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
