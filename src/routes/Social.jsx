import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useSocialStore } from '../store'
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Social() {
  const { darkMode, user } = useAppStore()
  const { posts, comments, isLoading, loadFeed, createPost, toggleLike, addCommentToPost, uploadMedia, hasMore, loadMore, editPost, deletePost, toggleCommentReaction, editComment, deleteComment, toggleBookmark, bookmarks, togglePin, getTrendingTags, filterAndSortPosts } = useSocialStore()
  const [content, setContent] = useState('')
  const [mediaFiles, setMediaFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [commentDraft, setCommentDraft] = useState({})
  const [editingPostId, setEditingPostId] = useState(null)
  const [editingPostText, setEditingPostText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [activeTab, setActiveTab] = useState('all') // all | mine | liked | media
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('new') // new | top | pinned
  const trending = getTrendingTags(8)

  useEffect(() => { loadFeed(true) }, [loadFeed])

  const filteredPosts = useMemo(() => filterAndSortPosts({
    mine: activeTab === 'mine',
    liked: activeTab === 'liked',
    mediaOnly: activeTab === 'media',
    search,
    sort
  }), [posts, activeTab, search, sort])

  const orderedPosts = useMemo(() => {
    return [...posts].sort((a, b) => (b.createdAt?.toDate?.() || new Date(b.createdAt)) - (a.createdAt?.toDate?.() || new Date(a.createdAt)))
  }, [posts])

  const onPickMedia = (e) => {
    const files = Array.from(e.target.files || [])
    setMediaFiles(files)
  }

  const submitPost = async () => {
    if (!content.trim() && mediaFiles.length === 0) return
    setUploading(true)
    try {
      const urls = []
      for (const f of mediaFiles) {
        const url = await uploadMedia(f)
        if (url) urls.push(url)
      }
      await createPost({ content, mediaUrls: urls })
      setContent('')
      setMediaFiles([])
    } finally {
      setUploading(false)
    }
  }

  const submitComment = async (postId, parentId = null) => {
    const text = commentDraft[parentId || postId]?.trim() || commentDraft[postId]?.trim()
    if (!text) return
    await addCommentToPost(postId, text, parentId)
    setCommentDraft((d) => ({ ...d, [parentId || postId]: '' }))
  }

  const getPostComments = (postId) => comments.filter(c => c.postId === postId && !c.parentId)
  const getReplies = (commentId) => comments.filter(c => c.parentId === commentId)

  const canEditPost = (p) => p.userId === user?.uid
  const canEditComment = (c) => c.userId === user?.uid
  const canDeleteComment = (c) => c.userId === user?.uid || c.postOwnerId === user?.uid

  const startEditPost = (p) => { setEditingPostId(p.id); setEditingPostText(p.content) }
  const saveEditPost = async (postId) => { await editPost(postId, { content: editingPostText }); setEditingPostId(null); setEditingPostText('') }

  const startEditComment = (c) => { setEditingCommentId(c.id); setEditingCommentText(c.content) }
  const saveEditComment = async (commentId) => { await editComment(commentId, editingCommentText); setEditingCommentId(null); setEditingCommentText('') }

  return (
    <div className={`${darkMode ? 'bg-gray-950 text-white' : 'bg-gradient-to-br from-slate-50 to-violet-50 text-slate-800'}`}>
      <div className="max-w-7xl mx-auto p-4">
        <Navbar />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-1">
            <Sidebar />
            {/* Trending and bookmarks */}
            <div className={`mt-4 rounded-xl border p-4 ${darkMode ? 'bg-gray-900/70 border-gray-800' : 'bg-white/70 backdrop-blur border-gray-200'}`}>
              <h3 className="text-sm font-semibold mb-2">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {trending.map(t => (
                  <button key={t.tag} onClick={() => setSearch('#'+t.tag)} className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>#{t.tag} <span className="opacity-70">{t.count}</span></button>
                ))}
                {trending.length === 0 && <div className="text-xs opacity-70">No tags yet</div>}
              </div>
            </div>
          </div>
          <div className={`md:col-span-3 rounded-2xl border p-4 ${darkMode ? 'bg-gray-900/70 border-gray-800' : 'bg-white/70 backdrop-blur border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'mine', label: 'My Posts' },
                  { id: 'liked', label: 'Liked' },
                  { id: 'media', label: 'Media' }
                ].map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-1.5 rounded text-xs font-medium border ${activeTab===t.id ? (darkMode?'bg-violet-600 text-white':'bg-violet-500 text-white') : (darkMode?'bg-gray-800 border-gray-700':'bg-gray-100 border-gray-200')}`}>{t.label}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search posts or #tags" className={`px-3 py-2 rounded text-sm border ${darkMode?'bg-gray-800 border-gray-700':'bg-white border-gray-200'}`} />
                <select value={sort} onChange={(e)=>setSort(e.target.value)} className={`px-3 py-2 rounded text-sm border ${darkMode?'bg-gray-800 border-gray-700':'bg-white border-gray-200'}`}>
                  <option value="new">Newest</option>
                  <option value="top">Top</option>
                  <option value="pinned">Pinned</option>
                </select>
              </div>
            </div>

            {/* Composer */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`${darkMode ? 'bg-gray-800/60' : 'bg-white/80'} p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
              <textarea
                placeholder="What's on your mind? Share achievements, study notes, or a status..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className={`w-full mb-2 px-3 py-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <label className={`px-3 py-1.5 rounded text-sm cursor-pointer ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                  Add Media
                  <input type="file" multiple className="hidden" onChange={onPickMedia} />
                </label>
                {mediaFiles.length > 0 && (
                  <motion.span initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-xs opacity-80">{mediaFiles.length} file(s) selected</motion.span>
                )}
                <motion.button whileTap={{ scale: 0.98 }} disabled={uploading} onClick={submitPost} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-violet-600 hover:bg-violet-500' : 'bg-violet-500 hover:bg-violet-400 text-white'} ${uploading ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}>
                  {uploading ? 'Posting...' : 'Post'}
                </motion.button>
                <span className="text-xs opacity-70">Newest posts appear below</span>
              </div>
            </motion.div>

            {/* Feed */}
            <div className="mt-4 space-y-3">
              <AnimatePresence>
                {isLoading && filteredPosts.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                    {[...Array(3)].map((_,i)=>(
                      <div key={i} className={`${darkMode?'bg-gray-800/60':'bg-white/90'} p-3 rounded-xl border ${darkMode?'border-gray-700':'border-gray-200'} animate-pulse`}>
                        <div className="h-4 w-32 rounded bg-gray-500/30 mb-2" />
                        <div className="h-3 w-64 rounded bg-gray-500/20" />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {filteredPosts.map((p, idx) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.03, 0.2) }} className={`${darkMode ? 'bg-gray-800/60' : 'bg-white/90'} p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-start gap-3">
                    <img src={p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.displayName || 'User')}&background=7c3aed&color=fff`} className="w-8 h-8 rounded-full ring-2 ring-violet-500/30" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{p.displayName}</div>
                          <div className={`text-xs opacity-70 mb-1`}>{new Date(p.createdAt?.toDate?.() || p.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <button onClick={()=>togglePin(p.id)} className={`${darkMode?'bg-gray-800 hover:bg-gray-700':'bg-gray-100 hover:bg-gray-200'} px-2 py-1 rounded`}>{p.pinned? 'Unpin':'Pin'}</button>
                          <button onClick={()=>toggleBookmark(p.id)} className={`${darkMode?'bg-gray-800 hover:bg-gray-700':'bg-gray-100 hover:bg-gray-200'} px-2 py-1 rounded`}>{bookmarks.includes(p.id)?'Bookmarked':'Bookmark'}</button>
                          <button onClick={()=>navigator.clipboard.writeText(window.location.origin+`/g/${p.id}`)} className={`${darkMode?'bg-gray-800 hover:bg-gray-700':'bg-gray-100 hover:bg-gray-200'} px-2 py-1 rounded`}>Share</button>
                        </div>
                      </div>

                      {editingPostId === p.id ? (
                        <textarea value={editingPostText} onChange={(e) => setEditingPostText(e.target.value)} rows={3} className={`w-full mb-2 px-3 py-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`} />
                      ) : (
                        <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{p.content}</div>
                      )}

                      {p.mediaUrls && p.mediaUrls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {p.mediaUrls.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noreferrer" className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded overflow-hidden block ring-1 ring-violet-500/20`}>
                              <img src={url} alt="attachment" className="w-full h-40 object-cover" />
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs">
                        <motion.button whileTap={{ scale: 0.96 }} onClick={() => toggleLike(p.id)} className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} px-2 py-1 rounded transition-colors`}>👍 {p.likes?.length || 0}</motion.button>
                        <span>{getPostComments(p.id).length} comments</span>
                        {editingPostId === p.id ? (
                          <>
                            <button onClick={() => saveEditPost(p.id)} className={`${darkMode ? 'bg-green-700' : 'bg-green-500 text-white'} px-2 py-1 rounded`}>Save</button>
                            <button onClick={() => { setEditingPostId(null); setEditingPostText('') }} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} px-2 py-1 rounded`}>Cancel</button>
                          </>
                        ) : (
                          canEditPost(p) && (
                            <>
                              <button onClick={() => startEditPost(p)} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} px-2 py-1 rounded`}>Edit</button>
                              <button onClick={() => deletePost(p.id)} className={`${darkMode ? 'bg-red-700' : 'bg-red-500 text-white'} px-2 py-1 rounded`}>Delete</button>
                            </>
                          )
                        )}
                      </div>

                      {/* Comments */}
                      <div className="mt-3 space-y-2">
                        {getPostComments(p.id).map(c => (
                          <div key={c.id} className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-2 rounded border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex items-start gap-2">
                              <img src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.displayName || 'User')}&background=7c3aed&color=fff`} className="w-6 h-6 rounded-full" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-medium">{c.displayName}</div>
                                  <div className="flex items-center gap-2 text-[10px]">
                                    <button onClick={() => toggleCommentReaction(c.id, 'like')} className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} px-2 py-1 rounded`}>👍 {(c.reactions||[]).filter(x => x.startsWith('like:')).length}</button>
                                    <button onClick={() => toggleCommentReaction(c.id, 'love')} className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} px-2 py-1 rounded`}>❤️ {(c.reactions||[]).filter(x => x.startsWith('love:')).length}</button>
                                    <button onClick={() => toggleCommentReaction(c.id, 'insight')} className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} px-2 py-1 rounded`}>💡 {(c.reactions||[]).filter(x => x.startsWith('insight:')).length}</button>
                                    {canEditComment(c) && (
                                      editingCommentId === c.id ? (
                                        <>
                                          <button onClick={() => saveEditComment(c.id)} className={`${darkMode ? 'bg-green-700' : 'bg-green-500 text-white'} px-2 py-1 rounded`}>Save</button>
                                          <button onClick={() => { setEditingCommentId(null); setEditingCommentText('') }} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} px-2 py-1 rounded`}>Cancel</button>
                                        </>
                                      ) : (
                                        <>
                                          <button onClick={() => startEditComment(c)} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} px-2 py-1 rounded`}>Edit</button>
                                          {canDeleteComment(c) && <button onClick={() => deleteComment(c.id)} className={`${darkMode ? 'bg-red-700' : 'bg-red-500 text-white'} px-2 py-1 rounded`}>Delete</button>}
                                        </>
                                      )
                                    )}
                                  </div>
                                </div>
                                {editingCommentId === c.id ? (
                                  <textarea value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)} rows={2} className={`w-full mt-1 px-2 py-1 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border text-xs`} />
                                ) : (
                                  <div className="text-xs opacity-80 mt-1">{c.content}</div>
                                )}

                                {/* Replies */}
                                <div className="ml-6 mt-2 space-y-2">
                                  {getReplies(c.id).map(r => (
                                    <div key={r.id} className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-2 rounded border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                      <div className="text-[11px] font-medium">{r.displayName}</div>
                                      <div className="text-[11px] opacity-80">{r.content}</div>
                                    </div>
                                  ))}
                                  <div className="flex items-center gap-2">
                                    <input
                                      value={commentDraft[c.id] || ''}
                                      onChange={(e) => setCommentDraft((d) => ({ ...d, [c.id]: e.target.value }))}
                                      placeholder="Write a reply..."
                                      className={`flex-1 px-3 py-1.5 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border text-xs`}
                                    />
                                    <button onClick={() => submitComment(p.id, c.id)} className={`px-3 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>Reply</button>
                                  </div>
                                </div>

                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center gap-2">
                          <input
                            value={commentDraft[p.id] || ''}
                            onChange={(e) => setCommentDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                            placeholder="Write a comment..."
                            className={`flex-1 px-3 py-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border text-sm`}
                          />
                          <button onClick={() => submitComment(p.id)} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>Comment</button>
                        </div>

                      </div>

                    </div>
                  </div>
                </motion.div>
              ))}

              {!isLoading && hasMore && (
                <div className="text-center">
                  <motion.button whileTap={{ scale: 0.98 }} onClick={loadMore} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>Load More</motion.button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
} 