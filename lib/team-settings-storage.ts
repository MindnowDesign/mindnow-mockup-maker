export type StoredTeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Member";
  pending?: boolean;
};

export type TeamSettings = {
  teamName: string;
  members: StoredTeamMember[];
};

const STORAGE_KEY = "mindnow:team-settings-v1";

type StoredFile = Record<string, TeamSettings>;

function readAll(): StoredFile {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredFile;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: StoredFile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadTeamSettings(ownerEmail: string): TeamSettings | null {
  const settings = readAll()[ownerEmail.trim().toLowerCase()];
  if (!settings) return null;
  if (!Array.isArray(settings.members)) return null;
  return {
    teamName: settings.teamName ?? "",
    members: settings.members.filter((member) => member.role === "Member"),
  };
}

export function saveTeamSettings(ownerEmail: string, settings: TeamSettings) {
  const key = ownerEmail.trim().toLowerCase();
  if (!key) return;

  const all = readAll();
  all[key] = {
    teamName: settings.teamName,
    members: settings.members.filter((member) => member.role === "Member"),
  };
  writeAll(all);
}
