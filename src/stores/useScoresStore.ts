import { create } from 'zustand';
import {
  AcademicData,
  PhysicalData,
  LeadershipData,
  Course,
  ACFTAssessment,
  ACFTEvent,
  LeadershipRole,
  Extracurricular,
} from '../engine/oml';
import * as storage from '../services/storage';

interface ScoresState {
  academic: AcademicData;
  physical: PhysicalData;
  leadership: LeadershipData;
  loaded: boolean;

  loadFromSQLite: () => Promise<void>;

  // Academic
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  setGPA: (gpa: number) => void;

  // Physical
  setACFTScore: (score: number) => void;
  setACFTEvents: (events: ACFTEvent[]) => void;
  addAssessment: (assessment: ACFTAssessment) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;

  // Leadership
  setCSTScore: (score: number) => void;
  setLeadershipTotal: (score: number) => void;
  addRole: (role: LeadershipRole) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  addExtracurricular: (ec: Extracurricular) => Promise<void>;
  deleteExtracurricular: (id: string) => Promise<void>;
}

const defaultAcademic: AcademicData = { gpa: 0, courses: [] };
const defaultPhysical: PhysicalData = { totalScore: 0, events: [], assessmentHistory: [] };
const defaultLeadership: LeadershipData = { cstScore: 0, roles: [], extracurriculars: [], totalScore: 0 };

function computeGPA(courses: Course[]): number {
  if (courses.length === 0) return 0;
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  if (totalCredits === 0) return 0;
  const totalPoints = courses.reduce((sum, c) => sum + c.gradePoints * c.credits, 0);
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

export const useScoresStore = create<ScoresState>((set, get) => ({
  academic: defaultAcademic,
  physical: defaultPhysical,
  leadership: defaultLeadership,
  loaded: false,

  loadFromSQLite: async () => {
    try {
      // Load courses
      const courseRows = await storage.getCourses();
      const courses: Course[] = courseRows.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        credits: r.credits,
        grade: r.grade,
        gradePoints: r.grade_points,
      }));
      const gpa = computeGPA(courses);

      // Load assessments
      const assessmentRows = await storage.getAssessments();
      const assessments: ACFTAssessment[] = assessmentRows.map((r) => ({
        id: r.id,
        date: r.date,
        totalScore: r.total_score,
        events: JSON.parse(r.events_json),
      }));
      const latestAssessment = assessments[0];

      // Load roles
      const roleRows = await storage.getRoles();
      const roles: LeadershipRole[] = roleRows.map((r) => ({
        id: r.id,
        title: r.title,
        unit: r.unit,
        startDate: r.start_date,
        endDate: r.end_date || undefined,
        active: r.active === 1,
        points: r.points,
      }));

      // Load extracurriculars
      const ecRows = await storage.getExtracurriculars();
      const extracurriculars: Extracurricular[] = ecRows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        points: r.points,
      }));

      const leadershipTotal =
        roles.reduce((sum, r) => sum + r.points, 0) +
        extracurriculars.reduce((sum, e) => sum + e.points, 0);

      set({
        academic: { gpa, courses },
        physical: {
          totalScore: latestAssessment?.totalScore || 0,
          events: latestAssessment?.events || [],
          assessmentHistory: assessments,
        },
        leadership: {
          cstScore: 0, // CST score stored in profile or separate field
          roles,
          extracurriculars,
          totalScore: leadershipTotal,
        },
        loaded: true,
      });
    } catch (e) {
      console.warn('Failed to load scores:', e);
      set({ loaded: true });
    }
  },

  // Academic actions
  addCourse: async (course) => {
    await storage.addCourse({
      id: course.id,
      code: course.code,
      name: course.name,
      credits: course.credits,
      grade: course.grade,
      grade_points: course.gradePoints,
    });
    const courses = [...get().academic.courses, course];
    set({ academic: { courses, gpa: computeGPA(courses) } });
  },

  updateCourse: async (id, data) => {
    await storage.updateCourse(id, {
      code: data.code,
      name: data.name,
      credits: data.credits,
      grade: data.grade,
      grade_points: data.gradePoints,
    });
    const courses = get().academic.courses.map((c) => (c.id === id ? { ...c, ...data } : c));
    set({ academic: { courses, gpa: computeGPA(courses) } });
  },

  deleteCourse: async (id) => {
    await storage.deleteCourse(id);
    const courses = get().academic.courses.filter((c) => c.id !== id);
    set({ academic: { courses, gpa: computeGPA(courses) } });
  },

  setGPA: (gpa) => set((s) => ({ academic: { ...s.academic, gpa } })),

  // Physical actions
  setACFTScore: (score) => set((s) => ({ physical: { ...s.physical, totalScore: score } })),

  setACFTEvents: (events) => {
    const totalScore = events.reduce((sum, e) => sum + e.score, 0);
    set((s) => ({ physical: { ...s.physical, events, totalScore } }));
  },

  addAssessment: async (assessment) => {
    await storage.addAssessment({
      id: assessment.id,
      date: assessment.date,
      total_score: assessment.totalScore,
      events_json: JSON.stringify(assessment.events),
    });
    set((s) => ({
      physical: {
        ...s.physical,
        totalScore: assessment.totalScore,
        events: assessment.events,
        assessmentHistory: [assessment, ...s.physical.assessmentHistory],
      },
    }));
  },

  deleteAssessment: async (id) => {
    await storage.deleteAssessment(id);
    const history = get().physical.assessmentHistory.filter((a) => a.id !== id);
    const latest = history[0];
    set((s) => ({
      physical: {
        ...s.physical,
        totalScore: latest?.totalScore || 0,
        events: latest?.events || [],
        assessmentHistory: history,
      },
    }));
  },

  // Leadership actions
  setCSTScore: (score) => set((s) => ({ leadership: { ...s.leadership, cstScore: score } })),

  setLeadershipTotal: (score) => set((s) => ({ leadership: { ...s.leadership, totalScore: score } })),

  addRole: async (role) => {
    await storage.addRole({
      id: role.id,
      title: role.title,
      unit: role.unit,
      start_date: role.startDate,
      end_date: role.endDate,
      active: role.active,
      points: role.points,
    });
    const roles = [...get().leadership.roles, role];
    const totalScore =
      roles.reduce((sum, r) => sum + r.points, 0) +
      get().leadership.extracurriculars.reduce((sum, e) => sum + e.points, 0);
    set((s) => ({ leadership: { ...s.leadership, roles, totalScore } }));
  },

  deleteRole: async (id) => {
    await storage.deleteRole(id);
    const roles = get().leadership.roles.filter((r) => r.id !== id);
    const totalScore =
      roles.reduce((sum, r) => sum + r.points, 0) +
      get().leadership.extracurriculars.reduce((sum, e) => sum + e.points, 0);
    set((s) => ({ leadership: { ...s.leadership, roles, totalScore } }));
  },

  addExtracurricular: async (ec) => {
    await storage.addExtracurricular({
      id: ec.id,
      name: ec.name,
      description: ec.description,
      points: ec.points,
    });
    const extracurriculars = [...get().leadership.extracurriculars, ec];
    const totalScore =
      get().leadership.roles.reduce((sum, r) => sum + r.points, 0) +
      extracurriculars.reduce((sum, e) => sum + e.points, 0);
    set((s) => ({ leadership: { ...s.leadership, extracurriculars, totalScore } }));
  },

  deleteExtracurricular: async (id) => {
    await storage.deleteExtracurricular(id);
    const extracurriculars = get().leadership.extracurriculars.filter((e) => e.id !== id);
    const totalScore =
      get().leadership.roles.reduce((sum, r) => sum + r.points, 0) +
      extracurriculars.reduce((sum, e) => sum + e.points, 0);
    set((s) => ({ leadership: { ...s.leadership, extracurriculars, totalScore } }));
  },
}));
