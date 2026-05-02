FactoryBot.define do
  factory :usuario do
    id            { SecureRandom.uuid }
    email         { Faker::Internet.unique.email }
    nome_completo { Faker::Name.full_name }

    trait :com_acesso do
      transient { empresa { create(:empresa) } }
      after(:create) { |u, e| create(:acesso_empresa, usuario: u, empresa: e.empresa) }
    end
  end

  factory :empresa do
    id           { SecureRandom.uuid }
    cnpj         { Faker::CNPJ.numeric }
    razao_social { Faker::Company.name }
    nome_fantasia { Faker::Company.name }
    saldo_inicial { 0 }
  end

  factory :acesso_empresa do
    id       { SecureRandom.uuid }
    empresa
    usuario
    papel    { 'dono' }
  end
end
