import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideTriangleAlert } from '@lucide/angular';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, LucideTriangleAlert],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {
  @Input() title = 'Konfirmasi';
  @Input() message = 'Apakah Anda yakin?';
  @Input() confirmText = 'Ya';
  @Input() cancelText = 'Batal';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}