import React, { useState } from 'react';
import { AppState, StudentProfile, Curriculum, Course } from './types';
import Admissions from './components/Admissions';
import Dashboard from './components/Dashboard';
import Classroom from './components/Classroom';
import { GraduationCap, LogOut, User } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.ADMISSIONS_FORM);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  // Handlers
  const handleAdmissionsComplete = (profile: StudentProfile, curr: Curriculum) => {
    setStudent(profile);
    setCurriculum(curr);
    setState(AppState.DASHBOARD);
  };

  const handleStartCourse = (course: Course) => {
    setActiveCourse(course);
    setState(AppState.CLASSROOM);
  };

  const handleCourseComplete = (courseId: string, grade: number) => {
    if (!curriculum || !student) return;

    // Update Curriculum
    const updatedCourses = curriculum.courses.map(c => 
        c.id === courseId ? { ...c, completed: true, grade } : c
    );
    setCurriculum({ ...curriculum, courses: updatedCourses });

    // Update Student Stats
    const totalCredits = updatedCourses.filter(c => c.completed).reduce((sum, c) => sum + c.credits, 0);
    const totalGradePoints = updatedCourses.filter(c => c.completed).reduce((sum, c) => sum + (c.grade || 0), 0);
    const completedCount = updatedCourses.filter(c => c.completed).length;
    
    // Simple 4.0 scale approximation
    const newGpa = completedCount > 0 ? (totalGradePoints / completedCount) / 25 : 4.0; // 100/25 = 4.0

    setStudent({
        ...student,
        creditsEarned: totalCredits,
        gpa: newGpa
    });

    setState(AppState.DASHBOARD);
    setActiveCourse(null);
  };

  const handleAdvanceWeek = () => {
      if(!student) return;
      const nextWeek = student.currentWeek + 1;
      setStudent({...student, currentWeek: nextWeek});
      // In a real app, this would unlock new content.
      alert(`Simulation: Advanced to Week ${nextWeek}. New lectures available.`);
  };

  // Views
  const renderContent = () => {
    switch (state) {
      case AppState.ADMISSIONS_FORM:
      case AppState.ENTRANCE_EXAM:
      case AppState.ADMISSIONS_RESULT:
        return <Admissions onComplete={handleAdmissionsComplete} />;
      
      case AppState.DASHBOARD:
        if (!student || !curriculum) return <div>Error: No student data</div>;
        return (
          <Dashboard 
            student={student} 
            curriculum={curriculum} 
            onStartCourse={handleStartCourse}
            onAdvanceWeek={handleAdvanceWeek}
          />
        );
      
      case AppState.CLASSROOM:
        if (!activeCourse || !student) return <div>Error: No course selected</div>;
        return (
          <Classroom 
            course={activeCourse} 
            week={student.currentWeek}
            onBack={() => setState(AppState.DASHBOARD)} 
            onCompleteCourse={handleCourseComplete}
          />
        );

      default:
        return <div>State not implemented: {state}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-900 text-white p-2 rounded-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-slate-900 leading-none">VIRTUVERSE</h1>
              <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">AI University Engine</p>
            </div>
          </div>
          
          {student && (
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900">{student.name}</span>
                <span className="text-xs text-slate-500">{student.fieldOfStudy}</span>
              </div>
              <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-600">
                <User className="w-4 h-4" />
              </div>
              <button 
                onClick={() => {
                    // Simple reset for demo
                    if(window.confirm("Reset application?")) window.location.reload();
                }}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Log Out"
              >
                  <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 h-[calc(100vh-64px)]">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
