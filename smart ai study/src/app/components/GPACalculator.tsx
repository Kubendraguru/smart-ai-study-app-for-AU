import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Calculator, Save } from 'lucide-react';
import { useApp } from './AppContext';
import { saveGpaRecord, fetchGpaRecords, type GPARecord } from '../../lib/gpa';

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: number;
}

const GRADE_POINTS = [
  { label: 'O (Outstanding)', value: 10 },
  { label: 'A+ (Excellent)', value: 9 },
  { label: 'A (Very Good)', value: 8 },
  { label: 'B+ (Good)', value: 7 },
  { label: 'B (Average)', value: 6 },
  { label: 'C (Satisfactory)', value: 5 },
  { label: 'U (Fail)', value: 0 },
];

export function GPACalculator() {
  const { session } = useApp();
  const [gpaRecords, setGpaRecords] = useState<GPARecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'Data Structures', credits: 4, grade: 9 },
    { id: '2', name: 'DBMS', credits: 4, grade: 8 },
    { id: '3', name: 'Computer Networks', credits: 3, grade: 7 },
    { id: '4', name: 'Operating Systems', credits: 4, grade: 9 },
    { id: '5', name: 'OOP', credits: 4, grade: 10 },
  ]);
  const [semester, setSemester] = useState(3);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session?.user.id) {
      fetchGpaRecords(session.user.id).then(setGpaRecords).catch(console.error);
    }
  }, [session]);

  const totalCredits = courses.reduce((a, c) => a + c.credits, 0);
  const totalPoints = courses.reduce((a, c) => a + c.credits * c.grade, 0);
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

  const addCourse = () => {
    setCourses(cs => [...cs, { id: Date.now().toString(), name: '', credits: 3, grade: 8 }]);
  };

  const removeCourse = (id: string) => {
    setCourses(cs => cs.filter(c => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(cs => cs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const saveGPA = async () => {
    if (!session?.user.id) return;
    try {
      const gpaValue = parseFloat(gpa.toFixed(2));
      await saveGpaRecord({ user_id: session.user.id, semester, gpa: gpaValue });
      const updated = gpaRecords.filter(r => r.semester !== semester);
      setGpaRecords([...updated, { user_id: session.user.id, semester, gpa: gpaValue }].sort((a, b) => a.semester - b.semester));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save GPA', err);
    }
  };

  const getGradeColor = (gpa: number) => {
    if (gpa >= 9) return 'from-emerald-500 to-teal-500';
    if (gpa >= 8) return 'from-blue-500 to-cyan-500';
    if (gpa >= 7) return 'from-violet-500 to-purple-500';
    if (gpa >= 6) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  const getGradeLabel = (gpa: number) => {
    if (gpa >= 9) return 'Outstanding 🏆';
    if (gpa >= 8) return 'Very Good ⭐';
    if (gpa >= 7) return 'Good 👍';
    if (gpa >= 6) return 'Average 📚';
    return 'Needs Work 💪';
  };

  return (
    <div className="space-y-4">
      {/* GPA Result Card */}
      <motion.div
        className={`relative overflow-hidden rounded-[24px] p-5 bg-gradient-to-br ${getGradeColor(gpa)}`}
        layout
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative z-10">
          <p className="text-white/70 text-xs font-medium mb-1">Semester {semester} GPA</p>
          <div className="flex items-end gap-2 mb-1">
            <motion.span
              key={gpa.toFixed(2)}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-white font-bold text-5xl"
            >
              {gpa.toFixed(2)}
            </motion.span>
            <span className="text-white/60 text-sm mb-2">/10</span>
          </div>
          <p className="text-white/80 text-sm">{getGradeLabel(gpa)}</p>
          <div className="flex items-center gap-3 mt-3 text-white/60 text-xs">
            <span>{totalCredits} credits</span>
            <span>·</span>
            <span>{courses.length} subjects</span>
          </div>
        </div>
      </motion.div>

      {/* Semester Selector */}
      <div className="flex items-center justify-between bg-white/5 border border-white/8 rounded-[18px] px-4 py-3">
        <span className="text-white/60 text-sm">Semester</span>
        <div className="flex gap-1">
          {[1,2,3,4,5,6,7,8].map(s => (
            <button
              key={s}
              onClick={() => setSemester(s)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                semester === s
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Courses */}
      <div className="space-y-2">
        {courses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white/5 border border-white/8 rounded-[18px] p-3 flex gap-2 items-center"
          >
            <input
              value={course.name}
              onChange={e => updateCourse(course.id, 'name', e.target.value)}
              placeholder="Subject name"
              className="flex-1 bg-transparent text-white text-xs placeholder-white/25 focus:outline-none min-w-0"
            />
            <select
              value={course.credits}
              onChange={e => updateCourse(course.id, 'credits', parseInt(e.target.value))}
              className="bg-white/8 border border-white/10 rounded-xl px-2 py-1.5 text-white text-xs focus:outline-none appearance-none w-16 text-center"
            >
              {[1,2,3,4,5,6].map(c => <option key={c} value={c} className="bg-[#1a1a2e]">{c}cr</option>)}
            </select>
            <select
              value={course.grade}
              onChange={e => updateCourse(course.id, 'grade', parseInt(e.target.value))}
              className="bg-white/8 border border-white/10 rounded-xl px-2 py-1.5 text-white text-xs focus:outline-none appearance-none w-14 text-center"
            >
              {GRADE_POINTS.map(g => <option key={g.value} value={g.value} className="bg-[#1a1a2e]">{g.value}</option>)}
            </select>
            <button onClick={() => removeCourse(course.id)} className="w-7 h-7 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={addCourse}
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-[16px] py-3 text-white/60 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={saveGPA}
          className={`flex-1 flex items-center justify-center gap-2 rounded-[16px] py-3 text-white text-sm font-semibold shadow-lg transition-all ${
            saved
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-violet-600 to-purple-600'
          }`}
        >
          {saved ? (
            <><Calculator className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save GPA</>
          )}
        </motion.button>
      </div>

      {/* GPA History */}
      {gpaRecords.length > 0 && (
        <div>
          <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">GPA History</h4>
          <div className="space-y-2">
            {gpaRecords.sort((a, b) => a.semester - b.semester).map(rec => (
              <div key={rec.semester} className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-[14px] px-4 py-2.5">
                <span className="text-white/40 text-xs w-16">Semester {rec.semester}</span>
                <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getGradeColor(rec.gpa)}`}
                    style={{ width: `${rec.gpa * 10}%` }}
                  />
                </div>
                <span className={`text-xs font-bold bg-gradient-to-r ${getGradeColor(rec.gpa)} bg-clip-text text-transparent`}>
                  {rec.gpa.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-white/3 border border-white/8 rounded-[16px] px-4 py-3 flex justify-between items-center">
            <span className="text-white/50 text-sm">CGPA</span>
            <span className="text-white font-bold text-xl">
              {(gpaRecords.reduce((a, r) => a + Number(r.gpa), 0) / gpaRecords.length).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
