import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { authService } from './auth.service';

/**
 * Directiva estructural para mostrar/ocultar elementos según roles
 *
 * @example
 * <!-- Mostrar solo si el usuario tiene el rol ADMIN -->
 * <button *hasRole="'ADMIN'" (click)="deleteItem()">Eliminar</button>
 *
 * <!-- Mostrar si el usuario tiene ADMIN o CAJERO -->
 * <div *hasRole="['ADMIN', 'CAJERO']">
 *   <h3>Panel de Ventas</h3>
 * </div>
 *
 * <!-- Mostrar si NO tiene el rol -->
 * <p *hasRole="'ADMIN'; else: false">Solo para admins</p>
 */
@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private roles: string[] = [];
  private requireAll = false;
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input()
  set hasRole(roles: string | string[]) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  /**
   * Si es true, requiere TODOS los roles. Si es false (default), requiere AL MENOS UNO
   */
  @Input()
  set hasRoleRequireAll(value: boolean) {
    this.requireAll = value;
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  ngOnDestroy(): void {
    this.viewContainer.clear();
  }

  private updateView(): void {
    const hasPermission = this.requireAll
      ? authService.hasAllRoles(this.roles)
      : authService.hasAnyRole(this.roles);

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
