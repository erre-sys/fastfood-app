import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';

import { authService } from '../../auth'; // deja el tuyo si es correcto
import { PERMISSIONS } from '../../auth/roles.config'; // AJUSTA RUTA si tuya es distinta

import {
  LucideAngularModule, Users, ShoppingCart, DollarSign, FolderTree, ShoppingBasket,
  LayoutGrid, Soup, Tag, Package, ArrowLeftRight, ClipboardList, CreditCard, X as XIcon,
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
  requiredRoles?: string[];
}

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, NgFor],
  templateUrl: './side-nav.component.html',
})
export class SideNavComponent {
  @Output() close = new EventEmitter<void>();

  // Iconos para template
  readonly XIcon = XIcon;

  private can(requiredRoles?: string[]): boolean {
    return !requiredRoles || authService.hasAnyRole(requiredRoles);
  }

  private readonly baseNavSections: NavSection[] = [
    {
      title: 'Proveedores',
      ariaLabel: 'Proveedores',
      items: [
        {
          route: '/proveedores',
          label: 'Proveedores',
          icon: Users,
          exactMatch: true,
          requiredRoles: PERMISSIONS.PROVEEDORES.VER,
        },
        {
          route: '/compras',
          label: 'Compras',
          icon: ShoppingCart,
          exactMatch: true,
          requiredRoles: PERMISSIONS.COMPRAS.VER,
        },
        {
          route: '/pago-proveedor',
          label: 'Pagos',
          icon: DollarSign,
          exactMatch: true,
          requiredRoles: PERMISSIONS.PAGOS_PROVEEDOR.VER,
        },
      ],
    },
    {
      title: 'Ingredientes',
      ariaLabel: 'Ingredientes',
      items: [
        {
          route: '/grupo-ingredientes',
          label: 'Grupos',
          icon: FolderTree,
          exactMatch: false,
          requiredRoles: PERMISSIONS.GRUPOS.VER,
        },
        {
          route: '/ingredientes',
          label: 'Ingredientes',
          icon: ShoppingBasket,
          exactMatch: false,
          requiredRoles: PERMISSIONS.INGREDIENTES.VER,
        },
      ],
    },
    {
      title: 'Platos',
      ariaLabel: 'Platos',
      items: [
        {
          route: '/grupo-platos',
          label: 'Grupos',
          icon: LayoutGrid,
          exactMatch: true,
          requiredRoles: PERMISSIONS.GRUPOS.VER,
        },
        {
          route: '/platos',
          label: 'Platos',
          icon: Soup,
          exactMatch: true,
          requiredRoles: PERMISSIONS.PLATOS.VER,
        },
        {
          route: '/promo-programada',
          label: 'Promos',
          icon: Tag,
          exactMatch: true,
          requiredRoles: PERMISSIONS.PROMOCIONES.VER,
        },
      ],
    },
    {
      title: 'Inventario',
      ariaLabel: 'Inventario',
      items: [
        {
          route: '/inventario',
          label: 'Stock',
          icon: Package,
          exactMatch: true,
          requiredRoles: PERMISSIONS.INVENTARIO.VER_STOCK,
        },
        {
          route: '/kardex',
          label: 'Kardex',
          icon: ArrowLeftRight,
          exactMatch: true,
          requiredRoles: PERMISSIONS.INVENTARIO.VER_KARDEX,
        },
      ],
    },
    {
      title: 'Operación',
      ariaLabel: 'Operación',
      items: [
        {
          route: '/pedidos',
          label: 'Pedidos',
          icon: ClipboardList,
          exactMatch: true,
          requiredRoles: PERMISSIONS.PEDIDOS.VER,
        },
        {
          route: '/pagos-cliente',
          label: 'Pagos',
          icon: CreditCard,
          exactMatch: true,
          requiredRoles: PERMISSIONS.PAGOS_CLIENTE.VER,
        },
      ],
    },
  ];

  // Lo que pinta el HTML (ya filtrado)
  get navSections(): NavSection[] {
    return this.baseNavSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => this.can(item.requiredRoles)),
      }))
      .filter((section) => section.items.length > 0);
  }

  // Link Inicio: tu home real es '/', no '/home'
  get homeRoute(): string {
    if (this.can(PERMISSIONS.DASHBOARD.VER)) return '/';

    // fallback: primera ruta permitida en el menú
    return this.navSections[0]?.items[0]?.route ?? '/unauthorized';
  }
}
