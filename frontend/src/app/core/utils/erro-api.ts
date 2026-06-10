/** Extrai a mensagem de erro de uma resposta de erro da API, juntando todas as
 * mensagens retornadas em `errors` (ex: campos faltando ou inválidos). */
export function extrairErroApi(err: any, fallback: string): string {
  const errors = err?.error?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.join(' ');
  }
  if (typeof errors === 'string' && errors.trim()) {
    return errors;
  }
  return fallback;
}
