class SprintsController < ApplicationController
  before_action :set_course, only: [:create, :create_collection]
  before_action :set_sprint, only: [:update, :destroy]

  # POST /courses/course_id/sprints
  def create
    @sprint = @course.sprints.create!(sprint_params)
    json_response(@sprint, :created)
  end

  # POST /courses/course_id/sprint-collection
  def create_collection
    sprints = []
    duration = params[:duration].to_i
    start_date = params[:start_date].to_date
    end_date = params[:end_date].to_date
    days = (start_date...end_date).count
    number_of_sprints = days/duration
    number_of_sprints.times do |i|
      end_date = start_date + duration.days
      sprint = @course.sprints.create!(
          { :name => "#{i+1}. Sprint",
            :start_date => start_date,
            :end_date => end_date
          }
      )
      sprints.append(sprint)
      start_date = end_date
    end
    json_response(sprints)
  end

  # PUT /sprints/:id
  # PATCH /sprints/:id
  def update
    @sprint.update_attributes!(sprint_params)
    json_response(@sprint)
  end

  # DELETE /sprints/:id
  def destroy
    @sprint.destroy!
    head :no_content
  end

  private

  def sprint_params
    # whitelist params
    params.permit(:name, :end_date, :start_date, :duration)
  end

  def set_course
    @course = Course.find_by!(id: params[:course_id])
  end

  def set_sprint
    @sprint = Sprint.find_by!(id: params[:id])
  end

end
