import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useOKRsStore } from '../store'
import { useState } from 'react'

export default function OKRs() {
  const { darkMode } = useAppStore()
  const { objectives, keyResults, createObjective, addKeyResult } = useOKRsStore()
  const [title, setTitle] = useState('')
  const [quarter, setQuarter] = useState(1)
  const [year, setYear] = useState(new Date().getFullYear())

  const [krTitle, setKrTitle] = useState('')
  const [krObjective, setKrObjective] = useState('')
  const [krTarget, setKrTarget] = useState(100)
  const [krUnit, setKrUnit] = useState('points')

  const createObj = async () => {
    if (!title) return
    await createObjective({ title, description: '', quarter, year })
    setTitle('')
  }

  const createKR = async () => {
    if (!krTitle || !krObjective) return
    await addKeyResult(krObjective, { title: krTitle, description: '', targetValue: Number(krTarget), unit: krUnit })
    setKrTitle('')
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
            <h1 className="text-xl font-semibold mb-4">OKRs</h1>

            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">Create Objective</div>
                <input className={`w-full mb-2 px-3 py-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`} placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="number" min={1} max={4} className={`px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} placeholder="Quarter" value={quarter} onChange={e => setQuarter(Number(e.target.value))} />
                  <input type="number" className={`px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} placeholder="Year" value={year} onChange={e => setYear(Number(e.target.value))} />
                </div>
                <button onClick={createObj} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-violet-600' : 'bg-violet-500 text-white'}`}>Create</button>
              </div>

              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">Add Key Result</div>
                <select className={`w-full mb-2 px-3 py-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`} value={krObjective} onChange={e => setKrObjective(e.target.value)}>
                  <option value="">Select Objective</option>
                  {objectives.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                </select>
                <input className={`w-full mb-2 px-3 py-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`} placeholder="Title" value={krTitle} onChange={e => setKrTitle(e.target.value)} />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="number" className={`px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} placeholder="Target" value={krTarget} onChange={e => setKrTarget(e.target.value)} />
                  <input className={`px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} placeholder="Unit" value={krUnit} onChange={e => setKrUnit(e.target.value)} />
                </div>
                <button onClick={createKR} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-violet-600' : 'bg-violet-500 text-white'}`}>Add</button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-xl p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">Objectives</div>
                <div className="space-y-2">
                  {objectives.map(o => (
                    <div key={o.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="text-sm font-medium">{o.title}</div>
                      <div className="text-xs opacity-70">Q{o.quarter} {o.year}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-xl p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">Key Results</div>
                <div className="space-y-2">
                  {keyResults.map(kr => (
                    <div key={kr.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="text-sm font-medium">{kr.title}</div>
                      <div className="text-xs opacity-70">{kr.currentValue}/{kr.targetValue} {kr.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
} 