import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  active = signal<boolean>(false);
  show() {
    this.active.set(true);
  }
  hide() {
    this.active.set(false);
  }
  async wrap<T>(p: Promise<T>): Promise<T> {
    this.show();
    try {
      return await p;
    } finally {
      this.hide();
    }
  }
}
