import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../types/toast.types';

let idCounter = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
    private _toasts = signal<Toast[]>([]);

    toasts = this._toasts.asReadonly();

    show(message: string, type: ToastType = 'info', duration = 3000) {
        const id = ++idCounter;

        const toast: Toast = { id, message, type, duration };

        this._toasts.update((prev) => [...prev, toast]);

        setTimeout(() => this.remove(id), duration);
    }

    success(message: string) {
        this.show(message, 'success');
    }

    error(message: string) {
        this.show(message, 'error');
    }

    warning(message: string) {
        this.show(message, 'warning');
    }

    info(message: string) {
        this.show(message, 'info');
    }

    remove(id: number) {
        this._toasts.update((prev) => prev.filter((t) => t.id !== id));
    }
}