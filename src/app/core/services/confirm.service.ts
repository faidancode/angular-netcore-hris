import { ApplicationRef, createComponent, EnvironmentInjector, Injectable, inject, EmbeddedViewRef } from '@angular/core';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  open(options: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      const componentRef = createComponent(ConfirmModalComponent, {
        environmentInjector: this.injector
      });

      Object.assign(componentRef.instance, options);

      componentRef.instance.confirm.subscribe(() => {
        this.close(componentRef);
        resolve(true);
      });

      componentRef.instance.cancel.subscribe(() => {
        this.close(componentRef);
        resolve(false);
      });

      this.appRef.attachView(componentRef.hostView);

      const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];
      document.body.appendChild(domElem);
    });
  }

  private close(componentRef: any) {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
}