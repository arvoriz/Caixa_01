Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get   "auth/me",             to: "auth#me"
      patch "auth/me",             to: "auth#atualizar_perfil"
      patch "auth/ultima_empresa", to: "auth#ultima_empresa"

      # Convites públicos (token como id)
      resources :convites, only: [:show], param: :token do
        member { post :aceitar }
      end

      resources :empresas, only: [:index, :create, :update] do
        member do
          post :transferir_titularidade
        end
        resources :acessos,     only: [:index, :destroy], controller: "empresa_acessos"
        resources :convites,    only: [:create],          controller: "empresa_convites"
        resources :categorias,  only: [:index, :create]
        resources :lancamentos, only: [:index, :create, :update, :destroy] do
          member do
            post :cancelar
            patch :propagar_grupo
            post  :parcelar
          end
        end
        resources :emprestimos, only: [:index, :create, :update, :destroy] do
          member do
            post :registrar_pagamento
          end
        end
        resources :relatorios, only: [] do
          collection do
            get :fluxo_caixa
            get :contas
            get :intercompany
            get :externos
          end
        end
      end
    end
  end

  get "up", to: proc { [200, {}, ["ok"]] }
end
