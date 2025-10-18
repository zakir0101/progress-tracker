import React, { useState } from 'react'
import TopicItem from './TopicItem'

function SyllabusContent({
  syllabusData,
  progressData = {},
  onTopicToggle,
  disabled = false
}) {
  const [expandedSections, setExpandedSections] = useState({})

  if (!syllabusData?.data?.variants) {
    return (
      <div className="p-8 text-center text-gray-600">
        <p>No syllabus data available for this selection.</p>
      </div>
    )
  }

  const toggleSection = (variantIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [variantIndex]: !prev[variantIndex]
    }))
  }

  return (
    <div className="p-8">
      {syllabusData.data.variants.map((variant, variantIndex) => {
        const isExpanded = expandedSections[variantIndex] !== false // Default to expanded

        // Group topics by chapter
        const chapters = {}
        variant.topics?.forEach(topic => {
          if (!chapters[topic.chapter_name]) {
            chapters[topic.chapter_name] = []
          }
          chapters[topic.chapter_name].push(topic)
        })

        return (
          <div key={variantIndex} className="border border-gray-200 rounded-lg mb-6 overflow-hidden">
            <div
              className="section-header"
              onClick={() => toggleSection(variantIndex)}
            >
              <span>{syllabusData.data.name} - {variant.name}</span>
              <span>{isExpanded ? '▲' : '▼'}</span>
            </div>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                isExpanded ? 'max-h-[2000px] p-5' : 'max-h-0 p-0'
              }`}
            >
              {Object.entries(chapters).map(([chapterName, topics]) => (
                <div key={chapterName} className="border border-gray-200 rounded mb-4 overflow-hidden">
                  <div className="chapter-header">
                    {chapterName}
                  </div>
                  <div className="p-4">
                    {topics.map(topic => (
                      <TopicItem
                        key={topic.id}
                        topic={topic}
                        isCompleted={progressData.topics?.[topic.id] || false}
                        onToggle={onTopicToggle}
                        disabled={disabled}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SyllabusContent