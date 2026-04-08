import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Download, Upload, Filter, FileText, FolderOpen, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from './AppContext';
import { fetchMaterials, uploadMaterial, deleteMaterial, type Material } from '../../lib/materials';

const TYPE_COLORS = {
  pdf: 'from-red-500 to-rose-600',
  doc: 'from-blue-500 to-indigo-600',
  notes: 'from-amber-500 to-orange-600',
};
const TYPE_EMOJIS = { pdf: '📄', doc: '📝', notes: '📒' };

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const DEPT_NAMES: Record<string, string> = {
  CSE: 'Computer Science and Engineering',
  IT: 'Information Technology',
  ECE: 'Electronics & Communication Engg.',
  EEE: 'Electrical & Electronics Engg.',
  MECH: 'Mechanical Engineering',
  CIVIL: 'Civil Engineering',
};

export function MaterialsPage() {
  const { user, session } = useApp();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingMats, setLoadingMats] = useState(true);
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '', subject: '', department: 'CSE', year: '1', semester: '1', type: 'pdf' as 'pdf'|'doc'|'notes',
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle'|'uploading'|'success'|'error'>('idle');
  const [uploadError, setUploadError] = useState('');

  const loadMaterials = async () => {
    try {
      setLoadingMats(true);
      // Students: auto-filtered by RLS (dept+year). Teachers: see all their uploads + RLS allows
      const data = await fetchMaterials();
      setMaterials(data);
    } catch (err) {
      console.error('Failed to load materials:', err);
    } finally {
      setLoadingMats(false);
    }
  };

  useEffect(() => { loadMaterials(); }, []);

  const filtered = materials.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async () => {
    if (!uploadFile || !uploadForm.title || !uploadForm.subject) {
      setUploadError('Please fill all fields and select a file.');
      return;
    }
    setUploadStatus('uploading');
    setUploadError('');
    setUploadProgress(30);

    try {
      const deptName = DEPT_NAMES[uploadForm.department] || uploadForm.department;
      await uploadMaterial({
        title: uploadForm.title,
        subject: uploadForm.subject,
        department: deptName,
        year: parseInt(uploadForm.year),
        semester: parseInt(uploadForm.semester),
        type: uploadForm.type,
        teacher_name: user?.name || 'Teacher',
        teacher_auth_id: session?.user.id || '',
        file: uploadFile,
      });
      setUploadProgress(100);
      setUploadStatus('success');
      await loadMaterials();
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadStatus('idle');
        setUploadProgress(0);
        setUploadFile(null);
        setUploadForm({ title: '', subject: '', department: 'CSE', year: '1', semester: '1', type: 'pdf' });
      }, 1500);
    } catch (err: any) {
      setUploadStatus('error');
      setUploadError(err?.message || 'Upload failed. Please try again.');
      setUploadProgress(0);
    }
  };

  const handleDelete = async (mat: Material) => {
    if (!confirm(`Delete "${mat.title}"?`)) return;
    try {
      await deleteMaterial(mat.id, mat.file_url);
      setMaterials(prev => prev.filter(m => m.id !== mat.id));
    } catch (err) {
      alert('Failed to delete material.');
    }
  };

  return (
    <div className="pb-28 min-h-screen" style={{ background: 'linear-gradient(135deg, #08081A 0%, #0D0820 100%)' }}>
      <div className="absolute top-20 right-0 w-48 h-48 bg-blue-700/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-white text-xl font-bold">Materials</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loadingMats ? 'Loading...' : `${materials.length} files available`}
            </p>
          </div>
          {user?.role === 'teacher' && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-lg shadow-violet-500/30"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </motion.button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search materials..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[18px] px-11 py-3.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/8 rounded-xl flex items-center justify-center">
            <Filter className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-5 mb-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Total Files', value: materials.length, emoji: '📁' },
          { label: 'PDFs', value: materials.filter(m => m.type === 'pdf').length, emoji: '📄' },
          { label: 'Notes', value: materials.filter(m => m.type === 'notes').length, emoji: '📒' },
        ].map(stat => (
          <div key={stat.label} className="bg-white/5 border border-white/8 rounded-[18px] p-3 flex flex-col items-center gap-1">
            <span className="text-xl">{stat.emoji}</span>
            <span className="text-white font-bold text-base">{stat.value}</span>
            <span className="text-white/30 text-[10px]">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Materials List */}
      <div className="px-5 space-y-3">
        {loadingMats ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-[20px] p-4 flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-[16px] bg-white/10 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded w-3/4" />
                <div className="h-2 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-12 h-12 mx-auto text-white/10 mb-3" />
            <p className="text-white/30 text-sm">No materials found</p>
            {user?.role === 'teacher' && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 text-violet-400 text-sm underline"
              >
                Upload your first material
              </button>
            )}
          </div>
        ) : (
          filtered.map((mat, i) => (
            <motion.div
              key={mat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white/5 border border-white/8 rounded-[20px] p-4 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${TYPE_COLORS[mat.type] || 'from-violet-500 to-purple-700'} flex items-center justify-center text-xl shadow-lg flex-shrink-0`}>
                {TYPE_EMOJIS[mat.type] || '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{mat.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-white/10 text-white/50 text-[10px] px-2 py-0.5 rounded-md font-medium">{mat.subject}</span>
                  {mat.file_size && <span className="text-white/30 text-[10px]">{mat.file_size}</span>}
                </div>
                <p className="text-white/25 text-[10px] mt-0.5">{mat.teacher_name} · {new Date(mat.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Download */}
                <a
                  href={mat.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-violet-600/30 to-purple-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0"
                >
                  <Download className="w-4 h-4 text-violet-400" />
                </a>
                {/* Delete (teacher only, own uploads) */}
                {user?.role === 'teacher' && mat.teacher_auth_id === session?.user.id && (
                  <button
                    onClick={() => handleDelete(mat)}
                    className="w-10 h-10 rounded-[14px] bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center">
          <motion.div
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            className="w-full max-w-[430px] bg-[#12121E] border border-white/10 rounded-t-[32px] p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Upload Material</h3>
              <button onClick={() => { setShowUploadModal(false); setUploadStatus('idle'); setUploadError(''); }} className="text-white/40">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Material Title *"
                value={uploadForm.title}
                onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-3.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/50"
              />
              <input
                placeholder="Subject Name *"
                value={uploadForm.subject}
                onChange={e => setUploadForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-3.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/50"
              />
              <select
                value={uploadForm.department}
                onChange={e => setUploadForm(f => ({ ...f, department: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-3.5 text-white text-sm focus:outline-none appearance-none"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#1a1a2e]">{d}</option>)}
              </select>
              <div className="grid grid-cols-3 gap-3">
                <select value={uploadForm.year} onChange={e => setUploadForm(f => ({ ...f, year: e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-[16px] px-3 py-3.5 text-white text-sm focus:outline-none appearance-none">
                  {[1,2,3,4].map(y => <option key={y} value={y} className="bg-[#1a1a2e]">Year {y}</option>)}
                </select>
                <select value={uploadForm.semester} onChange={e => setUploadForm(f => ({ ...f, semester: e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-[16px] px-3 py-3.5 text-white text-sm focus:outline-none appearance-none">
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-[#1a1a2e]">Sem {s}</option>)}
                </select>
                <select value={uploadForm.type} onChange={e => setUploadForm(f => ({ ...f, type: e.target.value as any }))}
                  className="bg-white/5 border border-white/10 rounded-[16px] px-3 py-3.5 text-white text-sm focus:outline-none appearance-none">
                  <option value="pdf" className="bg-[#1a1a2e]">PDF</option>
                  <option value="notes" className="bg-[#1a1a2e]">Notes</option>
                  <option value="doc" className="bg-[#1a1a2e]">Doc</option>
                </select>
              </div>

              {/* File Picker */}
              <label className="block w-full border-2 border-dashed border-white/15 rounded-[20px] py-8 flex flex-col items-center gap-2 text-white/30 cursor-pointer hover:border-violet-500/40 transition-colors">
                <FileText className={`w-8 h-8 ${uploadFile ? 'text-violet-400' : ''}`} />
                <span className="text-sm font-medium">
                  {uploadFile ? uploadFile.name : 'Tap to select PDF / File'}
                </span>
                {uploadFile && (
                  <span className="text-[11px] text-white/20">
                    {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
                <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)} />
              </label>

              {/* Progress Bar */}
              {uploadStatus === 'uploading' && (
                <div className="space-y-2">
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    />
                  </div>
                  <p className="text-white/40 text-xs text-center">Uploading... {uploadProgress}%</p>
                </div>
              )}

              {/* Error */}
              {uploadError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-red-400 text-xs">{uploadError}</p>
                </div>
              )}

              {/* Success */}
              {uploadStatus === 'success' && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <p className="text-emerald-400 text-xs">Uploaded successfully!</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowUploadModal(false); setUploadStatus('idle'); setUploadError(''); }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-[16px] py-3.5 text-white/60 text-sm font-medium"
                  disabled={uploadStatus === 'uploading'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-[16px] py-3.5 text-white text-sm font-semibold shadow-lg disabled:opacity-60"
                >
                  {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
