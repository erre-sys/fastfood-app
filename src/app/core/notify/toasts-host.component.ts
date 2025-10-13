import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { NotifyService } from './notify.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './toasts-host.component.html',
})
export class ToastHostComponent {
  constructor(public notify: NotifyService) {}
  track = (_: number, t: any) => t.id;
}
