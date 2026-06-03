import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { EmpresasApiService, Empresa } from '../../api/empresas-api.service';

@Component({
  selector: 'app-empresa-criar-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         (click)="fechar($event)">
      <div class="w-full max-w-lg rounded-2xl shadow-2xl border flex flex-col"
           [ngClass]="t.isDark() ? 'bg-[#121214] border-[#2a2a2c]' : 'bg-white border-slate-200'"
           (click)="$event.stopPropagation()">

        <div class="flex items-center justify-between p-6 border-b transition-colors"
             [ngClass]="t.isDark() ? 'border-[#2a2a2c]' : 'border-slate-100'">
          <h3 class="text-lg font-bold">Cadastrar Nova Empresa</h3>
          <button (click)="fechar()" class="p-1 rounded-lg transition-colors"
                  [ngClass]="t.isDark() ? 'text-gray-400 hover:bg-[#18181b]' : 'text-slate-400 hover:bg-slate-100'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="salvar()" class="p-6 space-y-5">

          @if (erro) {
            <div class="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">{{ erro }}</div>
          }

          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                   [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">CNPJ *</label>
            <input formControlName="cnpj" type="text" placeholder="00.000.000/0000-00" maxlength="18"
                   (input)="formatarCnpj($event)"
                   class="w-full text-sm rounded-xl focus:ring-1 focus:border-blue-500 block px-4 py-3 outline-none transition-colors border"
                   [class.border-red-500]="form.get('cnpj')?.invalid && form.get('cnpj')?.touched"
                   [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
            @if (form.get('cnpj')?.touched) {
              @if (form.get('cnpj')?.hasError('required')) {
                <span class="text-xs text-red-500 mt-1 block">CNPJ obrigatório</span>
              } @else if (form.get('cnpj')?.hasError('cnpjInvalido')) {
                <span class="text-xs text-red-500 mt-1 block">CNPJ inválido</span>
              }
            }
          </div>

          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                   [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Razão Social *</label>
            <input formControlName="razao_social" type="text" placeholder="Ex: Tech Solutions Software ME"
                   class="w-full text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors border"
                   [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
            @if (form.get('razao_social')?.invalid && form.get('razao_social')?.touched) {
              <span class="text-xs text-red-500 mt-1 block">Razão social obrigatória</span>
            }
          </div>

          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                   [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Nome Fantasia *</label>
            <input formControlName="nome_fantasia" type="text" placeholder="Como a empresa é conhecida"
                   class="w-full text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors border"
                   [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
            @if (form.get('nome_fantasia')?.invalid && form.get('nome_fantasia')?.touched) {
              <span class="text-xs text-red-500 mt-1 block">Nome fantasia obrigatório</span>
            }
          </div>

          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors"
                   [ngClass]="t.isDark() ? 'text-gray-400' : 'text-slate-500'">Saldo Inicial (R$) *</label>
            <input formControlName="saldo_atual" type="number" min="0" step="0.01" placeholder="0.00"
                   class="w-full text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-colors border"
                   [ngClass]="t.isDark() ? 'bg-[#18181b] border-[#2a2a2c] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'">
            @if (form.get('saldo_atual')?.touched) {
              @if (form.get('saldo_atual')?.hasError('required')) {
                <span class="text-xs text-red-500 mt-1 block">Saldo inicial obrigatório</span>
              } @else if (form.get('saldo_atual')?.hasError('min')) {
                <span class="text-xs text-red-500 mt-1 block">Saldo não pode ser negativo</span>
              }
            }
          </div>

          <div class="pt-1 flex justify-end gap-3">
            <button type="button" (click)="fechar()"
                    class="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors border"
                    [ngClass]="t.isDark() ? 'border-[#2a2a2c] text-gray-300 hover:bg-[#18181b]' : 'border-slate-200 text-slate-600 hover:bg-slate-100'">
              Cancelar
            </button>
            <button type="submit" [disabled]="salvando"
                    class="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-60 disabled:cursor-not-allowed">
              {{ salvando ? 'Salvando...' : 'Salvar Empresa' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class EmpresaCriarModalComponent {
  @Output() fechado       = new EventEmitter<void>();
  @Output() empresaCriada = new EventEmitter<Empresa>();

  t   = inject(ThemeService);
  private api = inject(EmpresasApiService);
  private fb  = inject(FormBuilder);

  salvando = false;
  erro     = '';

  form = this.fb.group({
    cnpj:          ['', [Validators.required, EmpresaCriarModalComponent.cnpjValidator]],
    razao_social:  ['', Validators.required],
    nome_fantasia: ['', Validators.required],
    saldo_atual: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  static cnpjValidator(ctrl: AbstractControl): ValidationErrors | null {
    const raw = (ctrl.value ?? '').replace(/\D/g, '');
    if (!raw) return null;
    if (raw.length !== 14) return { cnpjInvalido: true };
    if (/^(\d)\1+$/.test(raw)) return { cnpjInvalido: true };
    const calc = (n: number): number => {
      let s = 0, p = n - 7;
      for (let i = n; i >= 1; i--) { s += +raw[n - i] * p--; if (p < 2) p = 9; }
      return s % 11 < 2 ? 0 : 11 - (s % 11);
    };
    return calc(12) === +raw[12] && calc(13) === +raw[13] ? null : { cnpjInvalido: true };
  }

  formatarCnpj(event: Event): void {
    const el = event.target as HTMLInputElement;
    let v = el.value.replace(/\D/g, '').slice(0, 14);
    if (v.length > 12)     v = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8,12)}-${v.slice(12)}`;
    else if (v.length > 8) v = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8)}`;
    else if (v.length > 5) v = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5)}`;
    else if (v.length > 2) v = `${v.slice(0,2)}.${v.slice(2)}`;
    el.value = v;
    this.form.get('cnpj')!.setValue(v, { emitEvent: false });
  }

  fechar(event?: Event) {
    if (!event || event.target === event.currentTarget) this.fechado.emit();
  }

  salvar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando = true;
    this.erro     = '';
    const { cnpj, razao_social, nome_fantasia, saldo_atual } = this.form.value;
    this.api.criar({ cnpj: cnpj!, razao_social: razao_social!, nome_fantasia: nome_fantasia!, saldo_atual }).subscribe({
      next: empresa => {
        this.salvando = false;
        this.empresaCriada.emit(empresa);
        this.fechado.emit();
      },
      error: (err) => {
        this.erro     = err?.error?.errors?.[0] ?? 'Erro ao salvar empresa.';
        this.salvando = false;
      },
    });
  }
}
