import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useCalendarStore, useTaskStore } from '../store'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Calendar() {
  const { darkMode } = useAppStore()
  const { events, syncWithCalendar, createCalendarEvent } = useCalendarStore()
  const { goals } = useTaskStore()
  const [title, setTitle] = useState('')
  const [goalId, setGoalId] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const create = async () => {
    if (!title || !start || !end) return
    await createCalendarEvent(goalId || null, { title, description: '', startTime: new Date(start), endTime: new Date(end) })
    setTitle(''); setGoalId(''); setStart(''); setEnd('')
  }

  return (
    <div className={darkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-800'}>
      <div className="max-w-7xl mx-auto p-4">
        <Navbar />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-1">
            <Sidebar />
          </div>
          <div className={`md:col-span-3 rounded-2xl border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Calendar</h1>
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => syncWithCalendar('google')} className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Google Sync</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => syncWithCalendar('outlook')} className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Outlook Sync</motion.button>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid md:grid-cols-5 gap-2">
                <input className={`px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                <select className={`px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} value={goalId} onChange={e => setGoalId(e.target.value)}>
                  <option value="">No goal</option>
                  {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
                <input type="datetime-local" className={`px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} value={start} onChange={e => setStart(e.target.value)} />
                <input type="datetime-local" className={`px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} value={end} onChange={e => setEnd(e.target.value)} />
                <button onClick={create} className={`px-3 py-2 rounded ${darkMode ? 'bg-violet-600' : 'bg-violet-500 text-white'}`}>Create</button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mt-4">
              {events.map(e => (
                <div key={e.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="text-sm font-medium">{e.title}</div>
                  <div className="text-xs opacity-70">{new Date(e.startTime?.toDate?.() || e.startTime).toLocaleString()} - {new Date(e.endTime?.toDate?.() || e.endTime).toLocaleString()}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
} 