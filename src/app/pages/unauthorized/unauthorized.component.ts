import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShieldX, LogOut, Home } from 'lucide-angular';
import { authService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './unauthorized.component.html'
})
export default class UnauthorizedPage implements OnInit {
  // Icons
  readonly ShieldX = ShieldX;
  readonly LogOut = LogOut;
  readonly Home = Home;

   private router = inject(Router);
  // Data
  username = '';
  roles: string[] = [];
  requiredRoles = ['ADMIN', 'CAJERO', 'VENDEDOR'];

  ngOnInit(): void {
    this.loadUserInfo();
  }

  private async loadUserInfo(): Promise<void> {
    try {
      const profile = await authService.profile();
      this.username = profile.username || profile.name || profile.email || 'Desconocido';
      this.roles = authService.getAllRoles();
    } catch (err) {
      console.error('Error al cargar perfil del usuario:', err);
      this.username = 'Error al cargar';
    }
  }

  async logout(): Promise<void> {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  }

  home(): void {
    this.router.navigateByUrl('/');
  }
}
