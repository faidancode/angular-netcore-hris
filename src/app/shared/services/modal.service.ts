import {
  ApplicationRef,
  EnvironmentInjector,
  Injectable,
  Type,
  createComponent,
  inject,
  EventEmitter,
  EmbeddedViewRef,
} from '@angular/core';

export interface ModalComponent {
  success?: EventEmitter<any>;
  cancel?: EventEmitter<void>;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  open<T extends object, R = any>(
    component: Type<T>,
    options?: Partial<T>
  ): Promise<R | null> {
    return new Promise((resolve) => {
      const componentRef = createComponent(component, {
        environmentInjector: this.injector,
      });

      const instance = componentRef.instance as T & ModalComponent;

      if (options) {
        Object.assign(instance, options);
      }

      if (instance.success) {
        instance.success.subscribe((res: R) => {
          this.close(componentRef);
          resolve(res);
        });
      }

      if (instance.cancel) {
        instance.cancel.subscribe(() => {
          this.close(componentRef);
          resolve(null);
        });
      }

      this.appRef.attachView(componentRef.hostView);
      componentRef.changeDetectorRef.detectChanges();

      const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];
      document.body.appendChild(domElem);
    });
  }

  private close(componentRef: any) {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
}
