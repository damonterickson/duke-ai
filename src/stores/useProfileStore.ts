import { create } from 'zustand';
import { CadetProfile } from '../engine/oml';
import { getProfile, updateProfile as updateProfileDB } from '../services/storage';

interface ProfileState {
  profile: CadetProfile;
  loaded: boolean;
  loadFromSQLite: () => Promise<void>;
  updateProfile: (data: Partial<CadetProfile>) => Promise<void>;
}

const defaultProfile: CadetProfile = {
  id: 'default',
  name: '',
  yearGroup: 'MSIII',
  battalion: '',
  targetBranch: '',
  goalOML: 0,
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: defaultProfile,
  loaded: false,

  loadFromSQLite: async () => {
    try {
      const row = await getProfile();
      if (row) {
        set({
          profile: {
            id: row.id,
            name: row.name,
            yearGroup: row.year_group as CadetProfile['yearGroup'],
            battalion: row.battalion,
            targetBranch: row.target_branch,
            goalOML: row.goal_oml,
          },
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
    } catch (e) {
      console.warn('Failed to load profile:', e);
      set({ loaded: true });
    }
  },

  updateProfile: async (data) => {
    const current = get().profile;
    const updated = { ...current, ...data };
    set({ profile: updated });

    try {
      await updateProfileDB({
        name: updated.name,
        year_group: updated.yearGroup,
        battalion: updated.battalion,
        target_branch: updated.targetBranch,
        goal_oml: updated.goalOML,
      });
    } catch (e) {
      console.warn('Failed to persist profile:', e);
    }
  },
}));
