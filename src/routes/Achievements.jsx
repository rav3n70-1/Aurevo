import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useAchievementsStore } from '../store'

export default function Achievements() {
  const { darkMode } = useAppStore()
  const { achievements, badges, seasonalEvents, quests } = useAchievementsStore()

  return (
    <div className={darkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-800'}>
      <div className="max-w-7xl mx-auto p-4">
        <Navbar />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-1">
            <Sidebar />
          </div>
          <div className={`md:col-span-3 rounded-2xl border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h1 className="text-xl font-semibold mb-4">Achievements</h1>

            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">Badges</div>
                <div className="text-xs opacity-70">{badges.length} badges</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">Quests</div>
                <div className="text-xs opacity-70">{quests.length} quests</div>
              </div>
            </div>

            <div className="mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}">
              <div className="text-sm font-medium mb-2">Recent Achievements</div>
              <div className="grid md:grid-cols-3 gap-3">
                {achievements.map(a => (
                  <div key={a.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="text-xs opacity-70">{a.description}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
} 