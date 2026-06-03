export interface Usuario {
  id: string;
  nome_completo: string | null;
  email: string;
  ultima_empresa_id: string | null;
  criado_em: string;
}

export interface RespostaApi<T> {
  data: T;
  meta: Record<string, unknown>;
  errors: string[];
}
