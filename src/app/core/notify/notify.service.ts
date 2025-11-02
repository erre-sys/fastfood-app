import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface Toast { id: string; type: ToastType; text: string; timeout?: number; }

@Injectable({ providedIn: 'root' })
export class NotifyService {
  private list = signal<Toast[]>([]);
  items = this.list.asReadonly();

  private genId() {
    return (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  }
  private push(t: Omit<Toast, 'id'>) {
    const toast: Toast = { id: this.genId(), timeout: 4000, ...t };
    this.list.update(arr => [toast, ...arr]);
    if (toast.timeout && toast.timeout > 0) {
      setTimeout(() => this.dismiss(toast.id), toast.timeout);
    }
  }

  dismiss(id: string) { this.list.update(arr => arr.filter(x => x.id !== id)); }
  clear()             { this.list.set([]); }

  success(text: string, timeout = 3000) {
    console.log('✅ [NOTIFY] Success:', text);
    this.push({ type: 'success', text, timeout });
  }

  error(text: string, timeout = 8000) {
    console.error('❌ [NOTIFY] Error:', text);
    this.push({ type: 'error', text, timeout });
  }

  info(text: string, timeout = 4000) {
    console.log('ℹ️ [NOTIFY] Info:', text);
    this.push({ type: 'info', text, timeout });
  }

  warning(text: string, timeout = 5000) {
    console.warn('⚠️ [NOTIFY] Warning:', text);
    this.push({ type: 'warning', text, timeout });
  }

  /**
   * Procesa errores del backend y muestra notificación apropiada
   */
  handleError(err: any, defaultMessage = 'Ocurrió un error inesperado') {
    console.error('❌ [NOTIFY] Handling error:', err);

    let message = defaultMessage;

    // Extraer mensaje del error del backend (prioridad alta)
    if (err?.error?.mensaje) {
      message = err.error.mensaje;
    } else if (err?.error?.message) {
      message = err.error.message;
    } else if (err?.message) {
      message = err.message;
    } else {
      // Si no hay mensaje específico, usar mensajes por código de estado
      if (err?.status === 400) {
        message = 'Datos inválidos';
      } else if (err?.status === 401) {
        message = 'No tienes permisos para realizar esta acción';
      } else if (err?.status === 403) {
        message = 'No tienes acceso a este recurso';
      } else if (err?.status === 404) {
        message = 'El recurso solicitado no existe';
      } else if (err?.status === 409) {
        message = 'Conflicto con el estado actual';
      } else if (err?.status === 500) {
        message = 'Ocurrió un error en el servidor. Por favor, intenta más tarde.';
      } else if (err?.status === 0) {
        message = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }
    }

    this.error(message); // Auto-dismiss después de 8 segundos
  }
}
