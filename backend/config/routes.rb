Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth
      post   "auth/login",   to: "auth#login"
      delete "auth/logout",  to: "auth#logout"
      get    "auth/me",      to: "auth#me"

      # Resources (adicionar conforme o projeto crescer)
      # resources :users
    end
  end

  get "up", to: proc { [200, {}, ["ok"]] }
end
