import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import Toast from './Toast'

export default function ProfileAdvisorModal({ isOpen, onClose, token }) {
  const { user } = useAuthStore()
  const [healthScore, setHealthScore] = useState(null)
  const [advice, setAdvice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [expandedSection, setExpandedSection] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    const fetchAdvisor = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const [scoreRes, adviceRes] = await Promise.all([
          axios.get(`/api/profile-advisor/health-score/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal
          }),
          axios.get(`/api/profile-advisor/advice/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal
          })
        ])

        clearTimeout(timeoutId)
        setHealthScore(scoreRes.data)
        setAdvice(adviceRes.data)
      } catch (err) {
        console.error('Failed to fetch profile advisor', err)
        setToast({ message: 'Failed to load profile advisor', type: 'error' })
      } finally {
        setLoading(false)
      }
    }

    if (token && user) {
      setLoading(true)
      fetchAdvisor()
    }
  }, [isOpen, token, user])

  if (!isOpen) return null

  const getTierEmoji = (tier) => {
    switch (tier) {
      case 'Perfect':
        return '💕'
      case 'Excellent':
        return '✨'
      case 'Good':
        return '👍'
      case 'Fair':
        return '🤔'
      default:
        return '⚠️'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 45) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-900'
    if (score >= 75) return 'bg-blue-900'
    if (score >= 60) return 'bg-yellow-900'
    if (score >= 45) return 'bg-orange-900'
    return 'bg-red-900'
  }

  const AdviceItem = ({ item }) => {
    const typeColors = {
      critical: 'border-red-500 bg-red-900/20',
      warning: 'border-yellow-500 bg-yellow-900/20',
      info: 'border-blue-500 bg-blue-900/20',
      success: 'border-green-500 bg-green-900/20'
    }

    const typeEmojis = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✓'
    }

    return (
      <div className={`border-l-4 p-3 rounded ${typeColors[item.type]}`}>
        <div className="flex items-start gap-2">
          <span className="text-lg">{typeEmojis[item.type]}</span>
          <div className="flex-1">
            <h4 className="font-bold text-white text-sm">{item.title}</h4>
            <p className="text-gray-300 text-xs mt-1">{item.message}</p>
            {item.action && (
              <p className="text-pink-300 text-xs mt-2 font-semibold">→ {item.action}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="bg-gray-900 rounded-lg shadow-lg p-8 border border-soft-pink max-w-2xl w-full mx-4 my-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">💡 Profile Advisor</h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading profile advisor...</div>
        ) : !healthScore ? (
          <div className="text-center py-8 text-gray-400">Unable to load profile advisor</div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-6">Get personalized tips to optimise your profile and attract better matches</p>

            {/* Overall Health Score */}
            <div className={`${getScoreBgColor(healthScore.overallScore)} border-2 border-soft-pink rounded-lg p-6 mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Profile Health Score</h2>
                  <p className="text-gray-300 text-sm">How well optimised is your profile?</p>
                </div>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(healthScore.overallScore)}`}>
                    {healthScore.overallScore}
                  </div>
                  <div className="text-2xl mt-2">{getTierEmoji(healthScore.tier)}</div>
                  <p className="text-white font-bold text-sm mt-1">{healthScore.tier}</p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                <div className="bg-gray-800 rounded p-3 text-center">
                  <p className="text-gray-400 text-xs font-semibold">Completeness</p>
                  <p className={`text-2xl font-bold mt-1 ${getScoreColor(healthScore.scores.completeness)}`}>
                    {healthScore.scores.completeness}
                  </p>
                  <p className="text-gray-300 text-xs mt-2">Fill in all sections: photos, bio, questionnaire, intro video</p>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <p className="text-gray-400 text-xs font-semibold">Engagement</p>
                  <p className={`text-2xl font-bold mt-1 ${getScoreColor(healthScore.scores.engagement)}`}>
                    {healthScore.scores.engagement}
                  </p>
                  <p className="text-gray-300 text-xs mt-2">Send messages, respond to matches, participate in features</p>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <p className="text-gray-400 text-xs font-semibold">Authenticity</p>
                  <p className={`text-2xl font-bold mt-1 ${getScoreColor(healthScore.scores.authenticity)}`}>
                    {healthScore.scores.authenticity}
                  </p>
                  <p className="text-gray-300 text-xs mt-2">Use clear photos, honest info, and verification</p>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <p className="text-gray-400 text-xs font-semibold">Clarity</p>
                  <p className={`text-2xl font-bold mt-1 ${getScoreColor(healthScore.scores.clarity)}`}>
                    {healthScore.scores.clarity}
                  </p>
                  <p className="text-gray-300 text-xs mt-2">Good photos, well-written bio, clear answers</p>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <p className="text-gray-400 text-xs font-semibold">Optimisation</p>
                  <p className={`text-2xl font-bold mt-1 ${getScoreColor(healthScore.scores.optimization)}`}>
                    {healthScore.scores.optimization}
                  </p>
                  <p className="text-gray-300 text-xs mt-2">Use keywords, be specific, highlight best qualities</p>
                </div>
              </div>
            </div>

            {/* Advice Sections */}
            {advice && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Photos Section */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'photos' ? null : 'photos')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📸</span>
                      <div className="text-left">
                        <h3 className="font-bold text-white">Photo Optimisation</h3>
                        <p className="text-gray-400 text-xs">{advice.photos.length} tips</p>
                      </div>
                    </div>
                    <span className="text-gray-400">{expandedSection === 'photos' ? '▼' : '▶'}</span>
                  </button>
                  {expandedSection === 'photos' && (
                    <div className="px-4 py-3 bg-gray-700/50 space-y-3 border-t border-gray-600">
                      {advice.photos.map((item, idx) => (
                        <AdviceItem key={idx} item={item} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Bio Section */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'bio' ? null : 'bio')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📝</span>
                      <div className="text-left">
                        <h3 className="font-bold text-white">Bio Optimisation</h3>
                        <p className="text-gray-400 text-xs">{advice.bio.length} tips</p>
                      </div>
                    </div>
                    <span className="text-gray-400">{expandedSection === 'bio' ? '▼' : '▶'}</span>
                  </button>
                  {expandedSection === 'bio' && (
                    <div className="px-4 py-3 bg-gray-700/50 space-y-3 border-t border-gray-600">
                      {advice.bio.map((item, idx) => (
                        <AdviceItem key={idx} item={item} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Questionnaire Section */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'questionnaire' ? null : 'questionnaire')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">❓</span>
                      <div className="text-left">
                        <h3 className="font-bold text-white">Questionnaire Optimisation</h3>
                        <p className="text-gray-400 text-xs">{advice.questionnaire.length} tips</p>
                      </div>
                    </div>
                    <span className="text-gray-400">{expandedSection === 'questionnaire' ? '▼' : '▶'}</span>
                  </button>
                  {expandedSection === 'questionnaire' && (
                    <div className="px-4 py-3 bg-gray-700/50 space-y-3 border-t border-gray-600">
                      {advice.questionnaire.map((item, idx) => (
                        <AdviceItem key={idx} item={item} />
                      ))}
                    </div>
                  )}
                </div>

                {/* General Advice Section */}
                {advice.general.length > 0 && (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <button
                      onClick={() => setExpandedSection(expandedSection === 'general' ? null : 'general')}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💡</span>
                        <div className="text-left">
                          <h3 className="font-bold text-white">General Tips</h3>
                          <p className="text-gray-400 text-xs">{advice.general.length} tips</p>
                        </div>
                      </div>
                      <span className="text-gray-400">{expandedSection === 'general' ? '▼' : '▶'}</span>
                    </button>
                    {expandedSection === 'general' && (
                      <div className="px-4 py-3 bg-gray-700/50 space-y-3 border-t border-gray-600">
                        {advice.general.map((item, idx) => (
                          <AdviceItem key={idx} item={item} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full mt-6 text-black py-2 rounded-lg font-bold hover:opacity-80 transition"
              style={{ backgroundColor: '#FF689D' }}
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  )
}
