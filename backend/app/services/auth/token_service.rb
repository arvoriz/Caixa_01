module Auth
  class TokenService
    SECRET     = ENV.fetch("JWT_SECRET", Rails.application.secret_key_base)
    EXPIRATION = ENV.fetch("JWT_EXPIRATION_HOURS", 24).to_i.hours

    def self.encode(payload)
      payload[:exp] = EXPIRATION.from_now.to_i
      payload[:iat] = Time.now.to_i
      JWT.encode(payload, SECRET, "HS256")
    end

    def self.decode(token)
      JWT.decode(token, SECRET, true, algorithm: "HS256").first
    end
  end
end
