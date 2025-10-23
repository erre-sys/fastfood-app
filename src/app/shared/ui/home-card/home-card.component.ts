import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

type CardVariant = 'primary' | 'secondary' | 'success' | 'warning';
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning';

@Component({
  selector: 'app-home-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './home-card.component.html'
})
export class HomeCardComponent {
  // Inputs
  title = input.required<string>();
  total = input.required<number>();
  icon = input.required<any>(); // Lucide icon component
  variant = input<CardVariant>('primary'); // Color de la tarjeta
  buttonText = input<string>('Ver más');
  buttonVariant = input<ButtonVariant>('secondary'); // Color del botón

  // Output
  navigate = output<void>();

  onNavigate(): void {
    this.navigate.emit();
  }
}
