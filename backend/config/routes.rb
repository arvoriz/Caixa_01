Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth
      get "auth/me", to: "auth#me"

      # Empresas
      resources :empresas, only: [:index, :create]
    end
  end

  get "up", to: proc { [200, {}, ["ok"]] }
end
