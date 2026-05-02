module Auth
  class TokenService
    # O Supabase usa ECC (P-256 / ES256) para assinar os JWTs.
    # A chave pública JWKS é obtida do endpoint do projeto Supabase.
    JWKS_URI = "#{ENV.fetch('SUPABASE_URL')}/auth/v1/.well-known/jwks.json"

    def self.decodificar(token)
      jwks = JWT::JWK::Set.new(buscar_jwks)
      JWT.decode(token, nil, true, algorithms: %w[ES256 RS256], jwks: jwks).first
    end

    def self.buscar_jwks
      uri      = URI(JWKS_URI)
      resposta = Net::HTTP.get_response(uri)
      JSON.parse(resposta.body)
    end
    private_class_method :buscar_jwks
  end
end
