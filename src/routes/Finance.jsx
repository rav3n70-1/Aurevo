import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useFinanceStore } from '../store'
import { useState } from 'react'

export default function Finance() {
  const { darkMode } = useAppStore()
  const { financeGoals, createFinanceGoal, updateFinanceProgress } = useFinanceStore()
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currency, setCurrency] = useState('USD')

  const createGoal = async () => {
    if (!title || !targetAmount) return
    await createFinanceGoal({ title, targetAmount: Number(targetAmount), currency })
    setTitle('')
    setTargetAmount('')
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
            <h1 className="text-xl font-semibold mb-4">Finance Goals</h1>

            <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid md:grid-cols-4 gap-3">
                <input className={`px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                <input type="number" className={`px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} placeholder="Target Amount" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
                <input className={`px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} placeholder="Currency" value={currency} onChange={e => setCurrency(e.target.value)} />
                <button onClick={createGoal} className={`px-3 py-2 rounded ${darkMode ? 'bg-violet-600' : 'bg-violet-500 text-white'}`}>Create</button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mt-4">
              {financeGoals.map(g => (
                <div key={g.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">{g.title}</div>
                    <div className="text-xs opacity-70">{g.currency}</div>
                  </div>
                  <div className="text-xs opacity-70 mb-2">Target: {g.targetAmount}</div>
                  <div className={`h-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-2 bg-emerald-500 rounded" style={{ width: `${Math.round((g.currentAmount || 0) / g.targetAmount * 100)}%` }}></div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => updateFinanceProgress(g.id, 50)} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>+50</button>
                    <button onClick={() => updateFinanceProgress(g.id, 100)} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>+100</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 