import { Directive, ElementRef, Input, OnChanges, SimpleChanges, inject } from '@angular/core';

/** Rola o elemento para o topo sempre que o valor vinculado passar a ser "verdadeiro"
 * (ex: uma mensagem de erro apareceu), garantindo que o usuário a veja mesmo
 * com o conteúdo já rolado para baixo. */
@Directive({
  selector: '[appScrollTopOnChange]',
  standalone: true,
})
export class ScrollTopOnChangeDirective implements OnChanges {
  private el = inject(ElementRef<HTMLElement>);

  @Input('appScrollTopOnChange') valor: unknown;

  ngOnChanges(changes: SimpleChanges): void {
    const atual = changes['valor'];
    if (atual && !atual.previousValue && atual.currentValue) {
      this.el.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
