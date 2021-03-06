class SprintSerializer < ActiveModel::Serializer
  # attributes to be serialized
  attributes :id, :name, :start_date, :end_date, :course_id, :topic_ids, :permissions

  def permissions
    {
        :sprint => {
            :update => scope.can?(:update, object),
            :delete => scope.can?(:delete, object),
        }
    }
  end
end
