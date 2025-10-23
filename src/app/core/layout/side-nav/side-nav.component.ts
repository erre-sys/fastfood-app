import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';

import {
  LucideAngularModule,
  Users,
  ShoppingCart,
  DollarSign,
  FolderTree,
  ShoppingBasket,
  LayoutGrid,
  Soup,
  Tag,
  Package,
  ArrowLeftRight,
  ClipboardList,
  CreditCard,
  X as XIcon,
} from 'lucide-angular';

interface NavSection {
  title: string;
  ariaLabel: string;
  items: NavItem[];
}

interface NavItem {
  route: string;
  label: string;
  icon: any;
  exactMatch?: boolean;
}

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, NgFor],
  templateUrl: './side-nav.component.html',
})
export class SideNavComponent {
  @Output() close = new EventEmitter<void>();

  // Iconos
  XIcon = XIcon;

  navSections: NavSection[] = [
    {
      title: 'Proveedores',
      ariaLabel: 'Proveedores',
      items: [
        { route: '/proveedores', label: 'Proveedores', icon: Users, exactMatch: true },
        { route: '/compras', label: 'Compras', icon: ShoppingCart, exactMatch: true },
        { route: '/pago-proveedor', label: 'Pagos', icon: DollarSign, exactMatch: true },
      ]
    },
    {
      title: 'Ingredientes',
      ariaLabel: 'Ingredientes',
      items: [
        { route: '/grupo-ingredientes', label: 'Grupos', icon: FolderTree, exactMatch: false },
        { route: '/ingredientes', label: 'Ingredientes', icon: ShoppingBasket, exactMatch: false },
      ]
    },
    {
      title: 'Platos',
      ariaLabel: 'Platos',
      items: [
        { route: '/grupo-platos', label: 'Grupos', icon: LayoutGrid, exactMatch: true },
        { route: '/platos', label: 'Platos', icon: Soup, exactMatch: true },
        { route: '/promo-programada', label: 'Promos', icon: Tag, exactMatch: true },
      ]
    },
    {
      title: 'Inventario',
      ariaLabel: 'Inventario',
      items: [
        { route: '/inventario', label: 'Stock', icon: Package, exactMatch: true },
        { route: '/kardex', label: 'Kardex', icon: ArrowLeftRight, exactMatch: true },
      ]
    },
    {
      title: 'Operación',
      ariaLabel: 'Operación',
      items: [
        { route: '/pedidos', label: 'Pedidos', icon: ClipboardList, exactMatch: true },
        { route: '/pagos-cliente', label: 'Pagos', icon: CreditCard, exactMatch: true },
      ]
    }
  ];
}
