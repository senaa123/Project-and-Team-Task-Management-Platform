"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Project } from "@/types";
import { Plus, UserPlus, X, ShieldCheck } from "lucide-react";

// ─── Reusable Autocomplete Search Dropdown ────────────────────────────────────
function UserSearch({
  users,
  selectedId,
  onSelect,
  placeholder = "Search...",
}: {
  users: any[];
  selectedId: string;
  onSelect: (id: string, label: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = query
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase()) ||
          (u.empId && u.empId.toLowerCase().includes(query.toLowerCase()))
      )
    : users;

  const selected = users.find((u) => u.id === selectedId);

  return (
    <div className="relative">
      {selected ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 border border-primary-light text-xs text-gray-800 font-medium">
          <span className="flex-1">{selected.name} ({selected.empId || "No ID"})</span>
          <button onClick={() => { onSelect("", ""); setQuery(""); }} className="text-gray-400 hover:text-gray-600">
            <X size={12} />
          </button>
        </div>
      ) : (
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-light"
        />
      )}
      {open && !selected && (
        <div className="absolute z-20 w-full max-h-44 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg mt-1 text-xs divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-gray-400">No users found.</p>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                onMouseDown={() => { onSelect(u.id, u.name); setQuery(""); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-primary-50 transition"
              >
                <div className="font-bold text-gray-800">{u.name}</div>
                <div className="text-[10px] text-gray-400">{u.email}{u.empId ? ` · ${u.empId}` : ""}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── ProjectCard ───────────────────────────────────────────────────────────────
function TeamRoster({ project }: { project: Project }) {
  return (
    <div className="mt-3 mb-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Team</p>
      <div className="space-y-1.5 text-sm">
        {project.owner && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
            <span className="text-gray-700">{project.owner.name}</span>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Manager</span>
          </div>
        )}
        {project.members?.map((m, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            <span className="text-gray-600 text-sm">{m.user.name}</span>
          </div>
        ))}
        {!project.owner && (!project.members || project.members.length === 0) && (
          <p className="text-xs text-gray-400">No members assigned.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [changePmModal, setChangePmModal] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  // Assign Member
  const [memberId, setMemberId] = useState("");
  const [assignError, setAssignError] = useState("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Change PM
  const [pmId, setPmId] = useState("");
  const [pmError, setPmError] = useState("");
  const [pmList, setPmList] = useState<any[]>([]);

  const isAdmin = user?.role === "ADMIN";
  const canManage = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const fetchProjects = async () => {
    const res = await api.get("/projects");
    setProjects(res.data);
  };

  const fetchAllProjects = async () => {
    const res = await api.get("/projects/all");
    setAllProjects(res.data);
  };

  useEffect(() => {
    fetchProjects();
    fetchAllProjects();
  }, []);

  // "Other" projects the user is NOT part of
  const myProjectIds = new Set(projects.map((p) => p.id));
  const otherProjects = allProjects.filter((p) => !myProjectIds.has(p.id));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      await api.post("/projects", { name, description });
      setName("");
      setDescription("");
      setShowCreate(false);
      fetchProjects();
      fetchAllProjects();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignModal = async (projectId: string) => {
    setAssignModal(projectId);
    setMemberId("");
    setAssignError("");
    const res = await api.get("/users/verified");
    // Only TEAM_MEMBER roles
    setTeamMembers(res.data.filter((u: any) => u.role === "TEAM_MEMBER"));
  };

  const openChangePmModal = async (projectId: string) => {
    setChangePmModal(projectId);
    setPmId("");
    setPmError("");
    const res = await api.get("/users/verified");
    // Only PROJECT_MANAGER roles
    setPmList(res.data.filter((u: any) => u.role === "PROJECT_MANAGER"));
  };

  const handleAssign = async (projectId: string) => {
    setAssignError("");
    if (!memberId) { setAssignError("Please select a member from the list."); return; }
    try {
      await api.post(`/projects/${projectId}/members`, { userId: memberId });
      setMemberId("");
      setAssignModal(null);
      fetchProjects();
      fetchAllProjects();
    } catch (err: any) {
      setAssignError(err.response?.data?.message ?? "Failed to assign member");
    }
  };

  const handleChangePm = async (projectId: string) => {
    setPmError("");
    if (!pmId) { setPmError("Please select a PM from the list."); return; }
    try {
      await api.patch(`/projects/${projectId}/owner`, { ownerId: pmId });
      setPmId("");
      setChangePmModal(null);
      fetchProjects();
      fetchAllProjects();
    } catch (err: any) {
      setPmError(err.response?.data?.message ?? "Failed to change PM");
    }
  };

  const renderProjectCard = (project: Project, editable: boolean) => (
    <Card key={project.id}>
      <h3 className="font-semibold text-gray-800 mb-1">{project.name}</h3>
      <p className="text-sm text-gray-500 mb-1">{project.description || "No description"}</p>
      <p className="text-xs text-gray-400 mb-2">Created {new Date(project.createdAt).toLocaleDateString()}</p>

      <TeamRoster project={project} />

      {editable && canManage && (
        <div className="pt-3 border-t border-gray-100 space-y-2">
          {/* Assign Member button */}
          <button
            onClick={() => openAssignModal(project.id)}
            className="flex items-center gap-2 text-sm text-primary font-medium hover:opacity-80 transition"
          >
            <UserPlus size={15} /> Assign member
          </button>

          {/* Admin: Change PM button */}
          {isAdmin && (
            <button
              onClick={() => openChangePmModal(project.id)}
              className="flex items-center gap-2 text-sm text-purple-600 font-medium hover:opacity-80 transition"
            >
              <ShieldCheck size={15} /> Change Project Manager
            </button>
          )}
        </div>
      )}

      {/* Assign Member panel */}
      {editable && assignModal === project.id && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 relative">
          <p className="text-xs font-semibold text-gray-500 mb-1">Select Team Member</p>
          <UserSearch
            users={teamMembers}
            selectedId={memberId}
            onSelect={(id) => setMemberId(id)}
            placeholder="Search team members..."
          />
          {assignError && <p className="text-xs text-red-500 font-medium">{assignError}</p>}
          <div className="flex gap-2 mt-2">
            <Button onClick={() => handleAssign(project.id)} className="text-xs px-3 py-1.5" disabled={!memberId}>Assign</Button>
            <Button variant="secondary" onClick={() => { setAssignModal(null); setAssignError(""); }} className="text-xs px-3 py-1.5">Cancel</Button>
          </div>
        </div>
      )}

      {/* Change PM panel */}
      {editable && isAdmin && changePmModal === project.id && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 relative">
          <p className="text-xs font-semibold text-gray-500 mb-1">Select New Project Manager</p>
          <UserSearch
            users={pmList}
            selectedId={pmId}
            onSelect={(id) => setPmId(id)}
            placeholder="Search project managers..."
          />
          {pmError && <p className="text-xs text-red-500 font-medium">{pmError}</p>}
          <div className="flex gap-2 mt-2">
            <Button onClick={() => handleChangePm(project.id)} className="text-xs px-3 py-1.5" disabled={!pmId}>Reassign</Button>
            <Button variant="secondary" onClick={() => { setChangePmModal(null); setPmError(""); }} className="text-xs px-3 py-1.5">Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  );

  return (
    <div className="flex-1 flex flex-col py-8 px-8 overflow-y-auto bg-white text-gray-800 h-screen">
      <Topbar />

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {isAdmin ? "All Projects" : "Your Projects"}
        </h2>
        {canManage && (
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus size={16} /> New Project
          </Button>
        )}
      </div>

      {/* ── Create Project Form ───────────────────────────────── */}
      {showCreate && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Create Project</h3>
            <button onClick={() => setShowCreate(false)}><X size={18} className="text-gray-400" /></button>
          </div>
          <div className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </Card>
      )}

      {isAdmin ? (
        /* ── ADMIN: single editable grid of ALL projects ─────── */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {allProjects.map((project) => renderProjectCard(project, true))}
          {allProjects.length === 0 && (
            <Card className="sm:col-span-3 text-center text-gray-400 py-8">
              No projects found.
            </Card>
          )}
        </div>
      ) : (
        /* ── PM / MEMBER: Your Projects + read-only others ─────── */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {projects.map((project) => renderProjectCard(project, true))}
            {projects.length === 0 && (
              <Card className="sm:col-span-3 text-center text-gray-400 py-8">
                No projects assigned to you yet.
              </Card>
            )}
          </div>

          {otherProjects.length > 0 && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-semibold text-gray-700">All Projects</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">read-only</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {otherProjects.map((project) => renderProjectCard(project, false))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}