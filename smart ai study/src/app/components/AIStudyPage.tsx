import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Send, Paperclip, Sparkles, ChevronDown, Trash2, Settings } from 'lucide-react';
import { useApp } from './AppContext';

const SUGGESTED_QUESTIONS = [
  'Explain Binary Search Trees',
  'What is normalization in DBMS?',
  'How does TCP/IP work?',
  'Explain process scheduling',
  'What is polymorphism in OOP?',
];

const AI_RESPONSES: Record<string, string> = {
  default: "I'm your AI Study Assistant! I can help you understand concepts, solve problems, and prepare for exams. Configure your AI API key in settings for full functionality. For now, I'm in demo mode.",
  tree: "A Binary Search Tree (BST) is a hierarchical data structure where each node has at most two children. The left subtree contains nodes with values less than the root, and the right subtree contains nodes with values greater. This enables O(log n) search, insertion, and deletion on average. Key operations include Insert, Delete, Search, and Traversal (Inorder, Preorder, Postorder).",
  normal: "Normalization in DBMS is the process of organizing a database to reduce redundancy and improve data integrity. The normal forms are:\n• 1NF: Atomic values, no repeating groups\n• 2NF: 1NF + No partial dependencies\n• 3NF: 2NF + No transitive dependencies\n• BCNF: Stricter version of 3NF\nThe goal is to eliminate data anomalies (insertion, update, deletion).",
  tcp: "TCP/IP is the foundational communication protocol of the internet. TCP (Transmission Control Protocol) provides reliable, ordered, error-checked delivery of data. IP (Internet Protocol) handles addressing and routing. The 4-layer model: Application → Transport → Internet → Network Access. TCP uses a 3-way handshake (SYN, SYN-ACK, ACK) to establish connections.",
  process: "Process Scheduling determines which process gets CPU time. Key algorithms:\n• FCFS: First Come First Served\n• SJF: Shortest Job First\n• Round Robin: Time quantum-based\n• Priority Scheduling: Based on priority\n• Multilevel Queue: Multiple queues\nImportant metrics: CPU Utilization, Throughput, Turnaround Time, Waiting Time, Response Time.",
  poly: "Polymorphism in OOP allows objects of different types to be treated uniformly. Two types:\n• Compile-time (Static): Method overloading - same method name, different parameters\n• Runtime (Dynamic): Method overriding - subclass provides specific implementation of parent class method\nExample: Shape.draw() called on Circle, Rectangle, Triangle objects - each draws differently.",
};

function getResponse(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes('tree') || lower.includes('bst') || lower.includes('binary')) return AI_RESPONSES.tree;
  if (lower.includes('normal') || lower.includes('dbms') || lower.includes('1nf') || lower.includes('2nf')) return AI_RESPONSES.normal;
  if (lower.includes('tcp') || lower.includes('network') || lower.includes('protocol')) return AI_RESPONSES.tcp;
  if (lower.includes('process') || lower.includes('schedul') || lower.includes('cpu')) return AI_RESPONSES.process;
  if (lower.includes('poly') || lower.includes('oop') || lower.includes('inherit') || lower.includes('overload')) return AI_RESPONSES.poly;
  return AI_RESPONSES.default;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export function AIStudyPage() {
  const { subjects } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello! 👋 I'm your **AI Study Assistant** powered by RAG. I can:\n\n• 📚 Answer questions from your study materials\n• 🧠 Explain complex concepts clearly\n• 📝 Create summaries and study guides\n• ✅ Help you prepare for exams\n\nAsk me anything or upload a PDF to get started!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text?: string) => {
    const q = text || input.trim();
    if (!q) return;
    setInput('');
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getResponse(q),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(m => [...m, aiMsg]);
      setLoading(false);
    }, 1200 + Math.random() * 800);
  };

  const clearChat = () => setMessages(messages.slice(0, 1));

  return (
    <div className="flex flex-col h-screen pb-20" style={{ background: 'linear-gradient(135deg, #08081A 0%, #0D0820 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base">AI Study Assistant</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs">Ready · Demo Mode</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clearChat} className="w-9 h-9 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-white/40" />
            </button>
            <button className="w-9 h-9 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </div>

        {/* Subject Selector */}
        <button
          onClick={() => setShowSubjectPicker(s => !s)}
          className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-[16px] px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-violet-400 text-sm">📖</span>
            <span className="text-white/70 text-sm">{selectedSubject}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${showSubjectPicker ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showSubjectPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mt-2 bg-[#12121E] border border-white/10 rounded-[16px] overflow-hidden"
            >
              {['All Subjects', ...subjects.map(s => s.name)].map(s => (
                <button
                  key={s}
                  onClick={() => { setSelectedSubject(s); setShowSubjectPicker(false); }}
                  className={`w-full px-4 py-3 text-left text-sm border-b border-white/5 last:border-0 transition-colors ${
                    selectedSubject === s ? 'text-violet-300 bg-violet-500/10' : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-[18px] text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-tr-[4px]'
                  : 'bg-white/8 border border-white/10 text-white/80 rounded-tl-[4px]'
              }`}>
                {msg.content}
              </div>
              <span className="text-white/20 text-[10px] px-1">{msg.time}</span>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white/8 border border-white/10 px-4 py-3 rounded-[18px] rounded-tl-[4px]">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
          {SUGGESTED_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/60 whitespace-nowrap hover:border-violet-500/40 hover:text-white/80 transition-all flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="flex gap-2 items-end bg-white/5 border border-white/10 rounded-[20px] px-3 py-2">
          <button className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5">
            <Paperclip className="w-4 h-4 text-white/30" />
          </button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything about your subjects..."
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder-white/25 focus:outline-none resize-none py-1.5 max-h-28"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-[14px] bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center flex-shrink-0 mb-0.5 shadow-lg disabled:opacity-40 transition-opacity"
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
        <p className="text-center text-white/15 text-[10px] mt-2">AI responses are for study purposes only</p>
      </div>
    </div>
  );
}
