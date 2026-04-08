import { useParams, useNavigate } from 'react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, FolderOpen, Brain, Youtube, Download, ExternalLink, Play, ChevronRight } from 'lucide-react';
import { useApp } from './AppContext';

const TABS = [
  { id: 'book', label: 'AU Book', icon: BookOpen, emoji: '📚' },
  { id: 'materials', label: 'Materials', icon: FolderOpen, emoji: '📁' },
  { id: 'ai', label: 'AI Study', icon: Brain, emoji: '🤖' },
  { id: 'videos', label: 'Videos', icon: Youtube, emoji: '▶️' },
];

const BOOK_DATA: Record<string, { title: string; author: string; edition: string; pages: number; units: string[] }> = {
  '1': {
    title: 'Data Structures and Algorithms in C',
    author: 'E. Balagurusamy',
    edition: '4th Edition',
    pages: 712,
    units: ['Linear Data Structures', 'Trees', 'Graphs', 'Sorting & Searching', 'Hashing'],
  },
  '2': {
    title: 'Database Management Systems',
    author: 'Raghu Ramakrishnan',
    edition: '3rd Edition',
    pages: 893,
    units: ['Introduction to DBMS', 'Relational Model', 'SQL', 'Normalization', 'Transaction Management'],
  },
  '3': {
    title: 'Data Communications and Networking',
    author: 'Behrouz A. Forouzan',
    edition: '5th Edition',
    pages: 1264,
    units: ['Introduction', 'Physical Layer', 'Data Link Layer', 'Network Layer', 'Transport & Application'],
  },
  '4': {
    title: 'Operating System Concepts',
    author: 'Abraham Silberschatz',
    edition: '10th Edition',
    pages: 976,
    units: ['Process Management', 'CPU Scheduling', 'Memory Management', 'Virtual Memory', 'File Systems'],
  },
  '5': {
    title: 'Object-Oriented Programming with Java',
    author: 'E. Balagurusamy',
    edition: '7th Edition',
    pages: 568,
    units: ['Java Fundamentals', 'OOP Concepts', 'Inheritance & Polymorphism', 'Exception Handling', 'Collections'],
  },
  '6': {
    title: 'Discrete Mathematics and Its Applications',
    author: 'Kenneth H. Rosen',
    edition: '8th Edition',
    pages: 1088,
    units: ['Logic & Proofs', 'Sets & Functions', 'Graph Theory', 'Trees', 'Boolean Algebra'],
  },
};

const MOCK_VIDEOS = [
  { id: '1', title: 'Complete DSA Course in Tamil', channel: 'Tamil CS', views: '1.2M', duration: '8:42:00', thumbnail: '🎓' },
  { id: '2', title: 'Data Structures Full Course', channel: 'Abdul Bari', views: '4.5M', duration: '6:30:00', thumbnail: '🌳' },
  { id: '3', title: 'DSA - Arrays & Linked Lists', channel: 'CS Dojo', views: '890K', duration: '2:15:00', thumbnail: '🔗' },
  { id: '4', title: 'Tree Data Structures Explained', channel: 'mycodeschool', views: '2.1M', duration: '1:45:00', thumbnail: '🌲' },
];

type TabId = 'book' | 'materials' | 'ai' | 'videos';

export function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subjects, materials } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('book');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: string; text: string }[]>([
    { role: 'assistant', text: "Hello! I'm your AI Study Assistant. Ask me anything about this subject, or upload a PDF to get started! 🎓" },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const subject = subjects.find(s => s.id === id);
  const subjectMaterials = materials.filter(m => m.subjectId === id);
  const bookData = BOOK_DATA[id || '1'] || BOOK_DATA['1'];

  if (!subject) return (
    <div className="min-h-screen bg-[#08081A] flex items-center justify-center text-white">
      Subject not found
    </div>
  );

  const handleAiSend = () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages(m => [...m, { role: 'user', text: userMsg }]);
    setAiInput('');
    setAiLoading(true);
    setTimeout(() => {
      setAiMessages(m => [...m, {
        role: 'assistant',
        text: `Great question about "${userMsg}"! Based on the ${subject.name} curriculum, this topic relates to ${bookData.units[0]}. To get accurate AI responses powered by your study materials, please configure an AI API key in the settings. I can help you understand concepts, solve problems, and create study guides! 📚`,
      }]);
      setAiLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(135deg, #08081A 0%, #0D0820 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-white/70" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-base leading-tight truncate">{subject.name}</h1>
          <p className="text-white/40 text-xs">{subject.code} · {subject.credits} Credits</p>
        </div>
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-lg shadow-lg`}>
          {subject.emoji}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-5 mb-5">
        <div className="bg-white/5 border border-white/8 rounded-[20px] p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/50 text-xs">Course Progress</span>
            <span className="text-white font-semibold text-sm">{subject.progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${subject.progress}%` }}
              transition={{ duration: 1 }}
              className={`h-full rounded-full bg-gradient-to-r ${subject.color}`}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${subject.color} text-white shadow-lg`
                  : 'bg-white/5 border border-white/10 text-white/50'
              }`}
            >
              <span>{tab.emoji}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Book Tab */}
            {activeTab === 'book' && (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-[80px] opacity-5">📚</div>
                  <div className="relative z-10">
                    <div className="bg-white/10 rounded-xl px-3 py-1 text-xs text-white/50 font-medium inline-block mb-3">Anna University Textbook</div>
                    <h3 className="text-white font-bold text-base mb-1 leading-tight">{bookData.title}</h3>
                    <p className="text-white/50 text-sm mb-0.5">by {bookData.author}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="bg-white/10 rounded-lg px-2.5 py-1 text-xs text-white/60">{bookData.edition}</span>
                      <span className="bg-white/10 rounded-lg px-2.5 py-1 text-xs text-white/60">{bookData.pages} pages</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-white/50 text-xs font-medium mb-3 uppercase tracking-wider">Course Units</h4>
                  <div className="space-y-2">
                    {bookData.units.map((unit, i) => (
                      <motion.div
                        key={unit}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-[16px] px-4 py-3"
                      >
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${subject.color} flex items-center justify-center text-xs font-bold text-white shadow-md`}>
                          {i + 1}
                        </div>
                        <span className="text-white/70 text-sm">{unit}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-white/20 ml-auto" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div className="space-y-3">
                {subjectMaterials.length === 0 ? (
                  <div className="text-center py-12 text-white/30">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No materials uploaded yet</p>
                  </div>
                ) : (
                  subjectMaterials.map((mat, i) => (
                    <motion.div
                      key={mat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/5 border border-white/8 rounded-[20px] p-4 flex items-center gap-4"
                    >
                      <div className="w-11 h-11 rounded-[14px] bg-red-500/20 border border-red-500/20 flex items-center justify-center text-lg flex-shrink-0">
                        📄
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{mat.title}</p>
                        <p className="text-white/30 text-xs mt-0.5">{mat.uploadedBy} · {mat.size}</p>
                      </div>
                      <button className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Download className="w-4 h-4 text-white/50" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* AI Study Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-[20px] p-4 flex items-center gap-3">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <p className="text-violet-300 font-semibold text-sm">AI Study Assistant</p>
                    <p className="text-violet-300/60 text-xs mt-0.5">Powered by RAG · Ask from your materials</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-[18px] text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? `bg-gradient-to-r ${subject.color} text-white`
                          : 'bg-white/8 border border-white/10 text-white/80'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/8 border border-white/10 px-4 py-3 rounded-[18px]">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                    placeholder="Ask a question..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-[16px] px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/50"
                  />
                  <button
                    onClick={handleAiSend}
                    disabled={!aiInput.trim()}
                    className={`w-11 h-11 rounded-[16px] bg-gradient-to-r ${subject.color} flex items-center justify-center shadow-lg disabled:opacity-40`}
                  >
                    <span className="text-white text-lg">↑</span>
                  </button>
                </div>

                {/* PDF Upload */}
                <button className="w-full border border-dashed border-white/20 rounded-[20px] py-5 flex flex-col items-center gap-2 text-white/30 hover:border-violet-500/40 hover:text-white/50 transition-colors">
                  <span className="text-2xl">📎</span>
                  <span className="text-xs font-medium">Upload PDF to study from</span>
                </button>
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded-[20px] p-4 flex items-center gap-3">
                  <span className="text-2xl">▶️</span>
                  <div>
                    <p className="text-red-300 font-semibold text-sm">YouTube Learning</p>
                    <p className="text-red-300/50 text-xs">Configure YouTube API for live videos</p>
                  </div>
                </div>
                {MOCK_VIDEOS.map((video, i) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white/5 border border-white/8 rounded-[20px] p-4 flex gap-4"
                  >
                    <div className="w-20 h-14 rounded-[12px] bg-gradient-to-br from-red-500/30 to-orange-500/20 flex items-center justify-center text-2xl flex-shrink-0 relative">
                      {video.thumbnail}
                      <div className="absolute inset-0 flex items-center justify-center rounded-[12px] bg-black/20">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium leading-tight mb-1 line-clamp-2">{video.title}</p>
                      <p className="text-white/30 text-xs">{video.channel}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/20 text-[10px]">{video.views} views</span>
                        <span className="text-white/20 text-[10px]">·</span>
                        <span className="text-white/20 text-[10px]">{video.duration}</span>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0 self-start">
                      <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
