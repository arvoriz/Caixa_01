puts "Criando usuário admin..."

User.find_or_create_by(email: "admin@app.com") do |u|
  u.name     = "Administrador"
  u.password = "admin123"
  u.role     = :admin
end

puts "Seeds concluídos."
