unless Rails.env.test?
  Rails.application.configure do
    config.lograge.logger = ActiveSupport::Logger.new(STDOUT)
    config.lograge.enabled = true
    config.lograge.base_controller_class = ['ActionController::API', 'ApplicationController']
    config.lograge.formatter = Lograge::Formatters::Logstash.new
  end
end