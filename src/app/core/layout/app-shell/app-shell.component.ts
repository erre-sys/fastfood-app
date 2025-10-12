import { Component, HostBinding, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { NgIf } from '@angular/common';
import { LoadingComponent } from '../loading/loading.component';
import { ToastCenterComponent } from '../toast/toast-center.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [ NgIf, RouterOutlet, HeaderComponent, SideNavComponent, LoadingComponent, ToastCenterComponent ],
  templateUrl: './app-shell.component.html',
})
export default class AppShellComponent {
  isCollapsed = signal(false);
  isMobileOpen = signal(false);

  @HostBinding('class') host = 'block';

  toggleCollapse() {
    this.isCollapsed.update((v) => !v);
  }
  openMobile() {
    this.isMobileOpen.set(true);
  }
  closeMobile() {
    this.isMobileOpen.set(false);
  }
}
