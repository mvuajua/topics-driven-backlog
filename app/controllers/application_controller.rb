class ApplicationController < ActionController::API
  include Response
  include ExceptionHandler
  include CanCan::Ability

  serialization_scope :current_ability
  # called before every action on controllers
  before_action :authorize_request
  attr_reader :current_user

  # Check for valid request token and return user
  def authorize_request
    @current_user = (AuthorizeApiRequest.new(request.headers).call)[:user]
  end

  def current_ability
    if current_user
      @current_ability ||= Ability.new(current_user)
    end
  end
end
