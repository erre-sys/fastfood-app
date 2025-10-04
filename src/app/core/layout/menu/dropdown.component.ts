import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  imports: [NgIf],
  templateUrl: './dropdown.component.html',
})
export class DropdownComponent {
  open = false;
  constructor(private el: ElementRef) {}
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.el.nativeElement.contains(ev.target)) this.open = false;
  }
}
