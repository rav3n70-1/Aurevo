import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useTaskStore } from '../store'

export default function Roadmap() {
  const { darkMode } = useAppStore()
  const { getRoadmapData, linkGoals, unlinkGoals } = useTaskStore()

  const { timeline, links } = useMemo(() => getRoadmapData(), [getRoadmapData])

  // Determine overall time range
  const minDate = useMemo(() => new Date(Math.min(...timeline.map(t => t.start.getTime()))), [timeline])
  const maxDate = useMemo(() => new Date(Math.max(...timeline.map(t => t.end.getTime()))), [timeline])
  const totalDays = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)))

  const dayToPercent = (date) => {
    const d = date.getTime() - minDate.getTime()
    const pct = (d / (maxDate.getTime() - minDate.getTime() || 1)) * 100
    return Math.min(100, Math.max(0, pct))
  }

  const statusColor = (status, blocked) => {
    if (blocked || status === 'blocked') return 'bg-red-500'
    if (status === 'completed') return 'bg-green-500'
    if (status === 'in_progress') return 'bg-violet-500'
    return 'bg-gray-400'
  }

  const onBarClick = async (goalId) => {
    const depId = window.prompt('Enter dependency goal ID to toggle link (empty to cancel):')
    if (!depId) return
    // naive toggle: if link exists, unlink; else link
    const exists = links.some(l => l.from === depId && l.to === goalId)
    if (exists) await unlinkGoals(goalId, depId)
    else await linkGoals(goalId, depId)
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
      <div className="max-w-7xl mx-auto p-4">
        <Navbar />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-1">
            <Sidebar />
          </div>
          <div className={`md:col-span-3 rounded-2xl border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Roadmap</h1>
              <div className="text-xs opacity-70">Click a bar to link/unlink dependencies</div>
            </div>

            {/* Timeline Header */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="flex justify-between text-xs opacity-70 mb-2">
                  <span>{minDate.toDateString()}</span>
                  <span>{maxDate.toDateString()}</span>
                </div>
                <div className={`relative w-full h-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

                {/* Bars */}
                <div className="mt-4 space-y-3">
                  {timeline.map((item) => {
                    const left = dayToPercent(item.start)
                    const right = dayToPercent(item.end)
                    const width = Math.max(1, right - left)
                    return (
                      <div key={item.id} className="relative">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="truncate pr-2">{item.title}</span>
                          <span className="text-xs opacity-70">{item.durationDays}d</span>
                        </div>
                        <div className="relative h-8">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ duration: 0.6 }}
                            className={`absolute top-0 h-8 rounded ${statusColor(item.status, item.blocked)} cursor-pointer`}
                            style={{ left: `${left}%` }}
                            onClick={() => onBarClick(item.id)}
                          >
                            <div className="h-full bg-black/10 rounded" style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}></div>
                          </motion.div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex gap-4 text-xs">
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-violet-500 rounded"></span> In Progress</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded"></span> Completed</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded"></span> Blocked</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-400 rounded"></span> Not Started</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 