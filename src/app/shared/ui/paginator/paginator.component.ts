import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginator.component.html',
})
export class PaginatorComponent {
  @Input() from = 0;
  @Input() to = 0;
  @Input() total = 0;
  @Input() pageIndex = 0; 
  @Input() pageSize = 10;
  @Input() maxPage = 1;
  @Input() pageSizeOptions = [5, 10, 20, 50];

  @Output() sizeChange = new EventEmitter<number>();
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  onSizeChange(v: string | number) {
    const n = typeof v === 'string' ? parseInt(v, 10) : v;
    if (Number.isFinite(n)) this.sizeChange.emit(n as number);
  }

  goPrev() {
    this.prev.emit();
  }
  goNext() {
    this.next.emit();
  }
}
