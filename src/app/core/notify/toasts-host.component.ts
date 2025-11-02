import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { NotifyService } from './notify.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [NgFor],
  templateUrl: './toasts-host.component.html',
})
export class ToastHostComponent implements OnInit, OnDestroy {
  public notify = inject(NotifyService);
  private router = inject(Router);
  private destroyed$ = new Subject<void>();

  ngOnInit(): void {
    // Limpiar notificaciones cuando cambie de ruta
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.notify.clear();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  track = (_: number, t: any) => t.id;
}
