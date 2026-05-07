require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "rails/test_unit/railtie"

Bundler.require(*Rails.groups)

module App
  class Application < Rails::Application
    config.load_defaults 7.2
    config.api_only = true
    config.time_zone = "Brasilia"
    config.i18n.default_locale = :"pt-BR"
    config.i18n.load_path += Dir[Rails.root.join("config/locales/**/*.yml")]
  end
end
