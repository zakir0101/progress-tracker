import React from 'react'

function TopicItem({
  topic,
  isCompleted = false,
  onToggle,
  disabled = false
}) {
  return (
    <div className="topic-item">
      <input
        type="checkbox"
        id={topic.id}
        checked={isCompleted}
        onChange={() => onToggle(topic.id, !isCompleted)}
        disabled={disabled}
        className="topic-checkbox"
      />
      <label
        htmlFor={topic.id}
        className={`topic-label ${isCompleted ? 'completed' : ''}`}
      >
        {topic.topic_name}
      </label>
    </div>
  )
}

export default TopicItem