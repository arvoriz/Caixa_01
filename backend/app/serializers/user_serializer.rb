class UserSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :email, :role, :created_at
end
