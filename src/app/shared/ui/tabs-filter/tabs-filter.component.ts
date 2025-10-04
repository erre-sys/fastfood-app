import { Component, EventEmitter, Input, Output } from '@angular/core';

export type TabsKey = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-tabs-filter',
  standalone: true,
  templateUrl: './tabs-filter.component.html',
})
export class TabsFilterComponent {
  @Input({ required: true }) active: TabsKey = 'all';
  @Input() counters?: { all?: number; active?: number; inactive?: number };

  @Output() change = new EventEmitter<TabsKey>();

  setTab(k: TabsKey) {
    if (k !== this.active) this.change.emit(k);
  }
}
