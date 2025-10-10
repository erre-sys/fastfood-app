import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsHostComponent } from './core/notify/toasts-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastsHostComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'webapp';
}
