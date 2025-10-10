import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LucideAngularModule, ShoppingBasket, SquareMenu, Soup, LayoutDashboard, ShoppingBag } from 'lucide-angular';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule], 
  templateUrl: './side-nav.component.html',
})
export class SideNavComponent {
  @Output() close = new EventEmitter<void>();

  SquareMenu = SquareMenu;
  ShoppingBasket = ShoppingBasket;
  LayoutDashboard = LayoutDashboard;
  Soup = Soup;
  ShoppingBag = ShoppingBag;
}
