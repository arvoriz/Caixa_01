require 'net/http'

module Auth
  class TokenService
    JWKS_URI = "#{ENV.fetch('SUPABASE_URL')}/auth/v1/.well-known/jwks.json"

    # Cache em memória para não buscar JWKS a cada requisição
    @jwks_cache     = nil
    @jwks_cached_at = nil
    CACHE_TTL = 3600 # 1 hora

    def self.decodificar(token)
      jwks = JWT::JWK::Set.new(jwks_com_cache)
      JWT.decode(token, nil, true, algorithms: %w[ES256 RS256], jwks: jwks).first
    end

    def self.jwks_com_cache
      if @jwks_cache.nil? || (Time.now - @jwks_cached_at) > CACHE_TTL
        @jwks_cache     = buscar_jwks
        @jwks_cached_at = Time.now
      end
      @jwks_cache
    end
    private_class_method :jwks_com_cache

    def self.buscar_jwks
      uri      = URI(JWKS_URI)
      resposta = Net::HTTP.get_response(uri)
      JSON.parse(resposta.body)
    end
    private_class_method :buscar_jwks
  end
end
