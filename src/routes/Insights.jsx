import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useTaskStore } from '../store'

export default function Insights() {
  const { darkMode } = useAppStore()
  const { getGoalInsights } = useTaskStore()
  const insights = getGoalInsights()

  return (
    <div className={darkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-800'}>
      <div className="max-w-7xl mx-auto p-4">
        <Navbar />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-1">
            <Sidebar />
          </div>
          <div className={`md:col-span-3 rounded-2xl border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h1 className="text-xl font-semibold mb-4">Insights</h1>
            <div className="grid md:grid-cols-4 gap-3">
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm opacity-70">Total Goals</div>
                <div className="text-2xl font-semibold">{insights.totalGoals}</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm opacity-70">Completion Rate</div>
                <div className="text-2xl font-semibold">{Math.round(insights.completionRate)}%</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm opacity-70">Avg Completion Time</div>
                <div className="text-2xl font-semibold">{insights.avgCompletionTime}d</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm opacity-70">Velocity (7d)</div>
                <div className="text-2xl font-semibold">{insights.velocity7d}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium mb-2">At-risk Goals</div>
              <div className="grid md:grid-cols-2 gap-3">
                {insights.atRisk.map(g => (
                  <div key={g.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="text-sm font-medium">{g.title}</div>
                    <div className="text-xs opacity-70">Due {new Date(g.deadline?.toDate?.() || g.deadline).toLocaleDateString()} • {Math.round(g.progress || 0)}%</div>
                  </div>
                ))}
                {insights.atRisk.length === 0 && (
                  <div className="text-sm opacity-70">No goals at risk</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 