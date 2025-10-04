import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LucideAngularModule, Menu, Settings, ShoppingBag, Square } from 'lucide-angular';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule], 
  templateUrl: './side-nav.component.html',
})
export class SideNavComponent {
  @Output() close = new EventEmitter<void>();

  Menu = Menu;
  Square = Square;
  Settings = Settings;
  ShoppingBag = ShoppingBag;
}
