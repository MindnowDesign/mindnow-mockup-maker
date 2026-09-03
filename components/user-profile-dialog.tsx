"use client";

import { Pencil } from "lucide-react";
import { useState, type ReactNode } from "react";

import { AuthField, AuthInput } from "@/components/auth/auth-field";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  authLinkClass,
} from "@/lib/auth-form-styles";

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

const changeLinkClass = cn(authLinkClass, "self-start text-left");

const destructiveLinkClass = cn(
  "text-sm font-medium text-destructive transition-colors hover:text-destructive/80 self-start text-left"
);

const settingsOutlineButtonClass =
  "shrink-0 border-neutral-700 text-neutral-100 hover:bg-white/5 hover:text-neutral-50";

function SettingsSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-sm font-semibold text-neutral-50">{label}</p>
      {children}
    </div>
  );
}

function SettingsEditDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSave,
  saveDisabled,
  saveLabel = "Save",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSave: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6 sm:max-w-md">
        <DialogHeaderBlock title={title} description={description} />
        <div className="flex flex-col gap-4">{children}</div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="text-neutral-300 hover:bg-white/5 hover:text-neutral-50"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" size="md" onClick={onSave} disabled={saveDisabled}>
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogHeaderBlock({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-2 pr-8">
      <DialogTitle className="text-xl font-semibold tracking-tight">
        {title}
      </DialogTitle>
      {description ? (
        <DialogDescription>{description}</DialogDescription>
      ) : null}
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
  const [editTarget, setEditTarget] = useState<
    "name" | "email" | "password" | null
  >(null);
  const [draftName, setDraftName] = useState(fullName(user));
  const [draftEmail, setDraftEmail] = useState(user.email);
  const [draftPassword, setDraftPassword] = useState("");
  const [draftConfirmPassword, setDraftConfirmPassword] = useState("");
  const initials = getInitials(user.firstName, user.lastName);

  function openEdit(target: NonNullable<typeof editTarget>) {
    if (target === "name") setDraftName(fullName(user));
    if (target === "email") setDraftEmail(user.email);
    if (target === "password") {
      setDraftPassword("");
      setDraftConfirmPassword("");
    }
    setEditTarget(target);
  }

  function closeEdit() {
    setEditTarget(null);
  }

  function saveName() {
    const parts = draftName.trim().split(/\s+/);
    const firstName = parts[0] || user.firstName;
    const lastName = parts.slice(1).join(" ") || user.lastName;
    onUserChange({ ...user, firstName, lastName });
    closeEdit();
  }

  function saveEmail() {
    const next = draftEmail.trim();
    if (!next) return;
    onUserChange({ ...user, email: next });
    closeEdit();
  }

  function savePassword() {
    // Placeholder until auth is wired.
    closeEdit();
  }

  const passwordMismatch =
    draftPassword.length > 0 &&
    draftConfirmPassword.length > 0 &&
    draftPassword !== draftConfirmPassword;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 shrink-0 rounded-full after:rounded-full [&_[data-slot=avatar-fallback]]:rounded-full">
          <AvatarFallback
            className="rounded-full text-lg font-semibold text-neutral-50"
            style={{ backgroundColor: "#D94716" }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="ghost"
          className="text-neutral-300 hover:bg-white/5 hover:text-neutral-50"
          onClick={() => {
            // Placeholder until profile photo upload is wired.
          }}
        >
          <Pencil data-icon="inline-start" strokeWidth={1.75} aria-hidden />
          Edit
        </Button>
      </div>

      <SettingsSection label="Name">
        <p className="text-sm text-neutral-200">{fullName(user)}</p>
        <button
          type="button"
          className={changeLinkClass}
          onClick={() => openEdit("name")}
        >
          Change name
        </button>
      </SettingsSection>

      <SettingsSection label="Email">
        <p className="text-sm text-neutral-200">{user.email}</p>
        <button
          type="button"
          className={changeLinkClass}
          onClick={() => openEdit("email")}
        >
          Change email
        </button>
      </SettingsSection>

      <SettingsSection label="Password">
        <button
          type="button"
          className={changeLinkClass}
          onClick={() => openEdit("password")}
        >
          Change password
        </button>
      </SettingsSection>

      <SettingsEditDialog
        open={editTarget === "name"}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
        title="Change name"
        description="This is the name that will appear on your profile."
        onSave={saveName}
        saveDisabled={!draftName.trim()}
      >
        <AuthField id="profile-edit-name" label="Name">
          <AuthInput
            id="profile-edit-name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            autoFocus
          />
        </AuthField>
      </SettingsEditDialog>

      <SettingsEditDialog
        open={editTarget === "email"}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
        title="Change email"
        description="We'll use this email for account notifications."
        onSave={saveEmail}
        saveDisabled={!draftEmail.trim()}
      >
        <AuthField id="profile-edit-email" label="Email">
          <AuthInput
            id="profile-edit-email"
            type="email"
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
            autoFocus
          />
        </AuthField>
      </SettingsEditDialog>

      <SettingsEditDialog
        open={editTarget === "password"}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
        title="Change password"
        description="Choose a new password for your account."
        onSave={savePassword}
        saveDisabled={
          !draftPassword ||
          !draftConfirmPassword ||
          draftPassword !== draftConfirmPassword
        }
      >
        <AuthField id="profile-edit-password" label="New password">
          <AuthInput
            id="profile-edit-password"
            type="password"
            autoComplete="new-password"
            value={draftPassword}
            onChange={(e) => setDraftPassword(e.target.value)}
            autoFocus
          />
        </AuthField>
        <AuthField id="profile-edit-confirm-password" label="Confirm password">
          <AuthInput
            id="profile-edit-confirm-password"
            type="password"
            autoComplete="new-password"
            value={draftConfirmPassword}
            onChange={(e) => setDraftConfirmPassword(e.target.value)}
          />
        </AuthField>
        {passwordMismatch ? (
          <p className="text-sm text-red-400" role="alert">
            Passwords do not match.
          </p>
        ) : null}
      </SettingsEditDialog>
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
        <p className="text-sm text-neutral-400">
          Sign out of Mindnow on this device.
        </p>
        <button type="button" className={changeLinkClass} onClick={onSignOut}>
          Sign out
        </button>
      </SettingsSection>

      <SettingsSection label="Delete">
        <p className="text-sm text-neutral-400">
          Permanently delete your account and all associated data.
        </p>
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="w-full text-sm text-neutral-400 sm:w-auto">
              Delete this account permanently?
            </p>
            <Button
              type="button"
              variant="ghost"
              className="text-neutral-300 hover:bg-white/5 hover:text-neutral-50"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={onDeleteAccount}>
              Confirm delete
            </Button>
          </div>
        ) : (
          <button
            type="button"
            className={destructiveLinkClass}
            onClick={() => setConfirmDelete(true)}
          >
            Delete account
          </button>
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
  const [inviteOpen, setInviteOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "self",
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      role: "Owner",
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
    setInviteOpen(false);
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id || m.role === "Owner"));
  }

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection label="Team name">
        <p className="text-sm text-neutral-200">{teamName}</p>
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
      </SettingsSection>

      <SettingsEditDialog
        open={editingTeam}
        onOpenChange={setEditingTeam}
        title="Change team name"
        description="This name is visible to everyone on your team."
        onSave={saveTeamName}
        saveDisabled={!draftTeam.trim()}
      >
        <AuthField id="team-edit-name" label="Team name">
          <AuthInput
            id="team-edit-name"
            value={draftTeam}
            onChange={(e) => setDraftTeam(e.target.value)}
            autoFocus
          />
        </AuthField>
      </SettingsEditDialog>

      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-neutral-50">Members</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={settingsOutlineButtonClass}
            onClick={() => setInviteOpen(true)}
          >
            Invite
          </Button>
        </div>
        <ul className="mt-2 divide-y divide-neutral-800 rounded-lg border border-neutral-800">
          {members.map((member) => {
            const initials = getInitials(member.firstName, member.lastName);
            return (
              <li
                key={member.id}
                className="flex items-center gap-3 px-3 py-3"
              >
                <Avatar className="size-9 shrink-0 rounded-full after:rounded-full [&_[data-slot=avatar-fallback]]:rounded-full">
                  <AvatarFallback
                    className="rounded-full text-xs font-semibold text-neutral-50"
                    style={{ backgroundColor: "#D94716" }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-50">
                    {fullName(member)}
                  </p>
                  <p className="truncate text-xs text-neutral-400">{member.email}</p>
                </div>
                <span className="shrink-0 rounded-md bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
                  {member.role}
                </span>
                {member.role !== "Owner" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-neutral-400 hover:bg-white/5 hover:text-neutral-50"
                    onClick={() => removeMember(member.id)}
                  >
                    Remove
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <SettingsEditDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title="Invite member"
        description="Send an invitation to join your team."
        onSave={inviteMember}
        saveDisabled={!inviteEmail.trim()}
        saveLabel="Send invite"
      >
        <AuthField id="team-invite-email" label="Email">
          <AuthInput
            id="team-invite-email"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            autoFocus
          />
        </AuthField>
      </SettingsEditDialog>
    </div>
  );
}

type UserProfileDialogProps = {
  user: ProfileUser;
  trigger: ReactNode;
  teamLabel?: string;
  onSignOut?: () => void | Promise<void>;
};

export function UserProfileDialog({
  user: initialUser,
  trigger,
  teamLabel = "Mindnow",
  onSignOut,
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
              "h-auto w-full shrink-0 justify-start rounded-none border-neutral-800 bg-neutral-950/80 p-2",
              "flex flex-row gap-1 overflow-x-auto border-b",
              "sm:w-48 sm:flex-col sm:items-stretch sm:overflow-visible sm:border-r sm:border-b-0"
            )}
          >
            {(
              [
                ["profile", "Profile"],
                ["team", "Team Members"],
                ["account", "Account"],
              ] as const
            ).map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  "justify-start rounded-md px-3 py-2 text-sm font-medium",
                  "data-[state=active]:bg-white/5 data-[state=active]:text-neutral-50",
                  "data-[state=inactive]:text-neutral-400 data-[state=inactive]:hover:bg-white/5 data-[state=inactive]:hover:text-neutral-50",
                  "dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-white/5"
                )}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-neutral-800 px-6 py-4 pr-12">
              <h2 className="text-xl font-semibold tracking-tight text-neutral-50">
                {titles[tab]}
              </h2>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <TabsContent value="profile" className="mt-0">
                <ProfilePanel user={user} onUserChange={setUser} />
              </TabsContent>
              <TabsContent value="account" className="mt-0">
                <AccountPanel
                  onSignOut={async () => {
                    setOpen(false);
                    await onSignOut?.();
                  }}
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
