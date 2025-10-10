import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotifyService } from './notify.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toasts-host.component.html',
})
export class ToastsHostComponent {
  constructor(public notify: NotifyService) {}
  track = (_: number, t: any) => t.id;
}
