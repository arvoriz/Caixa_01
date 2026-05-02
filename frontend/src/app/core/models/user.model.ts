export type PerfilUsuario = 'dono' | 'socio' | 'contador';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  supabase_uid: string;
}

export interface RespostaApi<T> {
  data: T;
  meta: Record<string, unknown>;
  errors: string[];
}
