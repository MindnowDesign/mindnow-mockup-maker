"use client";

import { LogOut, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type ProfileUser = {
  firstName: string;
  lastName: string;
  email: string;
};

type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Owner" | "Member";
};

type SettingsTab = "profile" | "account" | "team";

function getInitials(firstName: string, lastName: string) {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  return (a + b).toUpperCase() || "–";
}

function fullName(user: Pick<ProfileUser, "firstName" | "lastName">) {
  return `${user.firstName} ${user.lastName}`.trim();
}

const changeLinkClass =
  "w-fit self-start text-left text-sm font-medium text-sky-400 transition-colors hover:text-sky-300";

const fieldInputClass =
  "box-border h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-white/20";

function SettingsSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-sm font-semibold text-white">{label}</p>
      {children}
    </div>
  );
}

function ProfilePanel({
  user,
  onUserChange,
}: {
  user: ProfileUser;
  onUserChange: (next: ProfileUser) => void;
}) {
  const [editing, setEditing] = useState<"name" | "email" | null>(null);
  const [draftName, setDraftName] = useState(fullName(user));
  const [draftEmail, setDraftEmail] = useState(user.email);
  const initials = getInitials(user.firstName, user.lastName);

  function startEditName() {
    setDraftName(fullName(user));
    setEditing("name");
  }

  function startEditEmail() {
    setDraftEmail(user.email);
    setEditing("email");
  }

  function saveName() {
    const parts = draftName.trim().split(/\s+/);
    const firstName = parts[0] || user.firstName;
    const lastName = parts.slice(1).join(" ") || user.lastName;
    onUserChange({ ...user, firstName, lastName });
    setEditing(null);
  }

  function saveEmail() {
    const next = draftEmail.trim();
    if (next) onUserChange({ ...user, email: next });
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 shrink-0 rounded-full after:rounded-full [&_[data-slot=avatar-fallback]]:rounded-full">
          <AvatarFallback
            className="rounded-full text-lg font-semibold text-white"
            style={{ backgroundColor: "#D94716" }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="secondary"
          className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
          onClick={() => {
            // Placeholder until profile photo upload is wired.
          }}
        >
          Upload profile photo
        </Button>
      </div>

      <SettingsSection label="Name">
        {editing === "name" ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              aria-label="Name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className={cn(fieldInputClass, "sm:max-w-xs")}
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="button" onClick={saveName}>
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-zinc-300 hover:bg-white/5 hover:text-white"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-200">{fullName(user)}</p>
            <button type="button" className={changeLinkClass} onClick={startEditName}>
              Change name
            </button>
          </>
        )}
      </SettingsSection>

      <SettingsSection label="Email">
        {editing === "email" ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              aria-label="Email"
              type="email"
              value={draftEmail}
              onChange={(e) => setDraftEmail(e.target.value)}
              className={cn(fieldInputClass, "sm:max-w-sm")}
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="button" onClick={saveEmail}>
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-zinc-300 hover:bg-white/5 hover:text-white"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-200">{user.email}</p>
            <button
              type="button"
              className={changeLinkClass}
              onClick={startEditEmail}
            >
              Change email
            </button>
          </>
        )}
      </SettingsSection>

      <SettingsSection label="Password">
        <button
          type="button"
          className={changeLinkClass}
          onClick={() => {
            // Placeholder until auth is wired.
          }}
        >
          Change password
        </button>
      </SettingsSection>
    </div>
  );
}

function AccountPanel({
  onSignOut,
  onDeleteAccount,
}: {
  onSignOut: () => void;
  onDeleteAccount: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection label="Sign out">
        <p className="text-sm text-zinc-400">
          Sign out of Mindnow on this device.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="w-fit bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
          onClick={onSignOut}
        >
          <LogOut data-icon="inline-start" strokeWidth={1.75} aria-hidden />
          Sign out
        </Button>
      </SettingsSection>

      <SettingsSection label="Delete">
        <p className="text-sm text-zinc-400">
          Permanently delete your account and all associated data.
        </p>
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="w-full text-sm text-zinc-400 sm:w-auto">
              Delete this account permanently?
            </p>
            <Button
              type="button"
              variant="ghost"
              className="text-zinc-300 hover:bg-white/5 hover:text-white"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={onDeleteAccount}>
              Confirm delete
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="destructive"
            className="w-fit"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 data-icon="inline-start" strokeWidth={1.75} aria-hidden />
            Delete account
          </Button>
        )}
      </SettingsSection>
    </div>
  );
}

function TeamMembersPanel({
  teamLabel,
  currentUser,
}: {
  teamLabel: string;
  currentUser: ProfileUser;
}) {
  const [teamName, setTeamName] = useState(teamLabel);
  const [editingTeam, setEditingTeam] = useState(false);
  const [draftTeam, setDraftTeam] = useState(teamLabel);
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "self",
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      role: "Owner",
    },
    {
      id: "m1",
      firstName: "Alex",
      lastName: "Rivera",
      email: "alex.rivera@example.com",
      role: "Member",
    },
    {
      id: "m2",
      firstName: "Sam",
      lastName: "Chen",
      email: "sam.chen@example.com",
      role: "Member",
    },
  ]);

  function saveTeamName() {
    const next = draftTeam.trim();
    if (next) setTeamName(next);
    setEditingTeam(false);
  }

  function inviteMember() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || members.some((m) => m.email.toLowerCase() === email)) return;
    const local = email.split("@")[0] || "member";
    const parts = local.split(/[._-]/).filter(Boolean);
    const firstName = parts[0]
      ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
      : "New";
    const lastName = parts[1]
      ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
      : "Member";
    setMembers((prev) => [
      ...prev,
      {
        id: `invite-${Date.now()}`,
        firstName,
        lastName,
        email,
        role: "Member",
      },
    ]);
    setInviteEmail("");
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id || m.role === "Owner"));
  }

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection label="Team name">
        {editingTeam ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              aria-label="Team name"
              value={draftTeam}
              onChange={(e) => setDraftTeam(e.target.value)}
              className={cn(fieldInputClass, "sm:max-w-xs")}
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="button" onClick={saveTeamName}>
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-zinc-300 hover:bg-white/5 hover:text-white"
                onClick={() => setEditingTeam(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-200">{teamName}</p>
            <button
              type="button"
              className={changeLinkClass}
              onClick={() => {
                setDraftTeam(teamName);
                setEditingTeam(true);
              }}
            >
              Change team name
            </button>
          </>
        )}
      </SettingsSection>

      <SettingsSection label="Members">
        <ul className="mt-2 divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {members.map((member) => {
            const initials = getInitials(member.firstName, member.lastName);
            return (
              <li
                key={member.id}
                className="flex items-center gap-3 px-3 py-3"
              >
                <Avatar className="size-9 shrink-0 rounded-full after:rounded-full [&_[data-slot=avatar-fallback]]:rounded-full">
                  <AvatarFallback
                    className="rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: "#D94716" }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {fullName(member)}
                  </p>
                  <p className="truncate text-xs text-zinc-400">{member.email}</p>
                </div>
                <span className="shrink-0 rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                  {member.role}
                </span>
                {member.role !== "Owner" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-zinc-400 hover:bg-white/5 hover:text-white"
                    onClick={() => removeMember(member.id)}
                  >
                    Remove
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </SettingsSection>

      <SettingsSection label="Invite member">
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <input
            aria-label="Invite email"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                inviteMember();
              }
            }}
            className={cn(fieldInputClass, "sm:max-w-sm")}
          />
          <Button
            type="button"
            className="h-10 w-fit py-0"
            disabled={!inviteEmail.trim()}
            onClick={inviteMember}
          >
            Send invite
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}

type UserProfileDialogProps = {
  user: ProfileUser;
  trigger: ReactNode;
  teamLabel?: string;
};

export function UserProfileDialog({
  user: initialUser,
  trigger,
  teamLabel = "Mindnow",
}: UserProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [user, setUser] = useState(initialUser);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setTab("profile");
    } else {
      setUser(initialUser);
    }
  }

  const titles: Record<SettingsTab, string> = {
    profile: "Profile",
    account: "Account",
    team: "Team Members",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl",
          "h-[min(36rem,85vh)] max-h-[85vh]"
        )}
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Manage your profile, account, and team members.
        </DialogDescription>

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as SettingsTab)}
          orientation="vertical"
          className="flex h-full min-h-0 flex-col gap-0 sm:flex-row"
        >
          <TabsList
            className={cn(
              "h-auto w-full shrink-0 justify-start rounded-none border-zinc-800 bg-zinc-950/80 p-2",
              "flex flex-row gap-1 overflow-x-auto border-b",
              "sm:w-48 sm:flex-col sm:items-stretch sm:overflow-visible sm:border-r sm:border-b-0"
            )}
          >
            {(
              [
                ["profile", "Profile"],
                ["account", "Account"],
                ["team", "Team Members"],
              ] as const
            ).map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  "justify-start rounded-md px-3 py-2 text-sm font-medium",
                  "data-[state=active]:bg-white/5 data-[state=active]:text-white",
                  "data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:bg-white/5 data-[state=inactive]:hover:text-white",
                  "dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-white/5"
                )}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-zinc-800 px-6 py-4 pr-12">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                {titles[tab]}
              </h2>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <TabsContent value="profile" className="mt-0">
                <ProfilePanel user={user} onUserChange={setUser} />
              </TabsContent>
              <TabsContent value="account" className="mt-0">
                <AccountPanel
                  onSignOut={() => setOpen(false)}
                  onDeleteAccount={() => setOpen(false)}
                />
              </TabsContent>
              <TabsContent value="team" className="mt-0">
                <TeamMembersPanel teamLabel={teamLabel} currentUser={user} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
