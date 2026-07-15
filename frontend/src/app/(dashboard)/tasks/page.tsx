"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Project, Task } from "@/types";
import { Plus, X, AlertTriangle, Clock, Loader2, Eye, CheckCircle2, Edit2 } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLUMNS: { key: string; label: string; color: string; icon: React.ReactNode; dot: string }[] = [
  { key: "TODO",        label: "To Do",       color: "bg-gray-50 border-gray-200",     icon: <Clock size={14} className="text-gray-400" />,      dot: "bg-gray-400" },
  { key: "IN_PROGRESS", label: "In Progress", color: "bg-blue-50 border-blue-200",     icon: <Loader2 size={14} className="text-blue-500" />,    dot: "bg-blue-500" },
  { key: "IN_REVIEW",   label: "In Review",   color: "bg-orange-50 border-orange-200", icon: <Eye size={14} className="text-orange-500" />,      dot: "bg-orange-500" },
  { key: "DONE",        label: "Done",        color: "bg-green-50 border-green-200",   icon: <CheckCircle2 size={14} className="text-green-500" />, dot: "bg-green-500" },
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW:    "bg-gray-100 text-gray-500",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH:   "bg-red-100 text-red-600",
};

const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

// ─── TaskCard ─────────────────────────────────────────────────────────────────
function TaskCard({
  task,
  canEdit,
  canManageTask,
  onStatusChange,
  onEdit,
}: {
  task: Task;
  canEdit: boolean;
  canManageTask: boolean;
  onStatusChange: (taskId: string, status: string) => void;
  onEdit: (task: Task) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 space-y-2 hover:shadow-md transition-shadow relative group">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-800 leading-snug pr-4">{task.title}</p>
        {canManageTask && (
          <button 
            onClick={() => onEdit(task)}
            className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1"
          >
            <Edit2 size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.MEDIUM}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="text-[10px] text-gray-400">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        {task.assignee && (
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium ml-auto">
            {task.assignee.empId || task.assignee.name.split(' ')[0]}
          </span>
        )}
      </div>

      {canEdit ? (
        <CustomSelect
          options={STATUS_OPTIONS.map((s) => ({ label: s.replace(/_/g, " "), value: s }))}
          value={task.status}
          onChange={(val) => onStatusChange(task.id, val)}
          className="w-full"
        />
      ) : (
        <span className="text-[10px] text-gray-400 italic">{task.status.replace(/_/g, " ")}</span>
      )}
    </div>
  );
}

// ─── KanbanBoard ─────────────────────────────────────────────────────────────
function KanbanBoard({
  tasks,
  canEdit,
  canManageTask,
  onStatusChange,
  onEdit,
}: {
  tasks: Task[];
  canEdit: boolean;
  canManageTask: boolean;
  onStatusChange: (taskId: string, status: string) => void;
  onEdit: (task: Task) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className={`rounded-2xl border ${col.color} p-4 min-h-[220px] flex flex-col`}>
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-4">
              {col.icon}
              <span className="text-sm font-semibold text-gray-700">{col.label}</span>
              <span className="ml-auto text-xs bg-white border border-gray-200 text-gray-500 font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                {columnTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 flex-1">
              {columnTasks.length === 0 ? (
                <p className="text-xs text-gray-300 text-center pt-6 select-none">Empty</p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canEdit={canEdit}
                    canManageTask={canManageTask}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const [createError, setCreateError] = useState("");
  const [statusError, setStatusError] = useState("");

  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  
  // Edit State
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editError, setEditError] = useState("");

  const [members, setMembers] = useState<any[]>([]);

  const isAdmin = user?.role === "ADMIN";
  const isPM = user?.role === "PROJECT_MANAGER";

  // Find selected project data to check ownership
  const selectedProjectData = projects.find((p) => p.id === selectedProject);
  const isProjectOwner = isAdmin || (isPM && selectedProjectData?.ownerId === user?.id);
  // PMs can edit tasks only in their own projects; TEAM_MEMBER can change status of own assigned tasks
  const canEditTasks = isAdmin || isProjectOwner || user?.role === "TEAM_MEMBER";

  useEffect(() => {
    api.get("/projects/all").then((res) => {
      setProjects(res.data);
      if (res.data[0]) setSelectedProject(res.data[0].id);
    });
  }, []);

  const fetchTasks = (projectId: string) => {
    api.get(`/tasks/project/${projectId}`).then((res) => setTasks(res.data));
  };

  const fetchMembers = (projectId: string) => {
    api.get(`/projects/${projectId}/members`).then((res) => setMembers(res.data));
  };

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
      fetchMembers(selectedProject);
    }
  }, [selectedProject]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (isSubmitting) return;
    setCreateError("");
    setIsSubmitting(true);
    try {
      await api.post("/tasks", {
        projectId: selectedProject,
        title,
        assigneeId: assigneeId || undefined,
        priority,
        dueDate: dueDate || undefined,
      });
      setTitle("");
      setAssigneeId("");
      setDueDate("");
      setShowCreate(false);
      fetchTasks(selectedProject);
    } catch (err: any) {
      setCreateError(err.response?.data?.message ?? "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOpen = (task: Task) => {
    setEditTaskId(task.id);
    setTitle(task.title);
    setAssigneeId(task.assigneeId || "");
    setPriority(task.priority);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
  };

  const handleEditSubmit = async () => {
    if (isSubmitting || !editTaskId) return;
    setEditError("");
    setIsSubmitting(true);
    try {
      await api.patch(`/tasks/${editTaskId}`, {
        title,
        assigneeId: assigneeId || undefined,
        priority,
        dueDate: dueDate || undefined,
      });
      setEditTaskId(null);
      fetchTasks(selectedProject);
    } catch (err: any) {
      setEditError(err.response?.data?.message ?? "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    setStatusError("");
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      fetchTasks(selectedProject);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to update status";
      const code = err.response?.status;
      setStatusError(
        code === 403 ? `⛔ Access denied: ${msg}` : `Failed to update status: ${msg}`
      );
      fetchTasks(selectedProject);
    }
  };

  return (
    <div className="flex-1 flex flex-col py-8 px-8 overflow-y-auto bg-white text-gray-800 h-screen">
      <Topbar />

      {statusError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span className="flex-1">{statusError}</span>
          <button onClick={() => setStatusError("")}><X size={16} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
          <div className="w-56">
            <CustomSelect
              options={projects.map((p) => ({ label: p.name, value: p.id }))}
              value={selectedProject}
              onChange={(val) => {
                setSelectedProject(val);
                setStatusError("");
              }}
              searchable
            />
          </div>
        </div>

        {/* Only show "New Task" if admin or if PM owns this project */}
        {(isAdmin || (isPM && isProjectOwner)) && (
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus size={16} /> New Task
          </Button>
        )}
      </div>

      {/* Create Task Form */}
      {showCreate && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Create Task</h3>
            <button onClick={() => setShowCreate(false)}><X size={18} className="text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="col-span-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
            <div className="w-full">
              <CustomSelect
                options={[
                  { label: "Unassigned", value: "" },
                  ...members.map((m) => ({ label: m.name, subLabel: m.empId || "No Emp ID", value: m.id }))
                ]}
                value={assigneeId}
                onChange={setAssigneeId}
                searchable
                placeholder="Assignee"
              />
            </div>
            <div className="w-full">
              <CustomSelect
                options={[
                  { label: "Low", value: "LOW" },
                  { label: "Medium", value: "MEDIUM" },
                  { label: "High", value: "HIGH" },
                ]}
                value={priority}
                onChange={setPriority}
              />
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="col-span-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
          </div>
          {createError && <p className="text-sm text-red-500 mt-3">{createError}</p>}
          <Button onClick={handleCreate} className="mt-3" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </Card>
      )}

      {/* Edit Task Form */}
      {editTaskId && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Edit Task</h3>
            <button onClick={() => setEditTaskId(null)}><X size={18} className="text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="col-span-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
            <div className="w-full">
              <CustomSelect
                options={[
                  { label: "Unassigned", value: "" },
                  ...members.map((m) => ({ label: m.name, subLabel: m.empId || "No Emp ID", value: m.id }))
                ]}
                value={assigneeId}
                onChange={setAssigneeId}
                searchable
                placeholder="Assignee"
              />
            </div>
            <div className="w-full">
              <CustomSelect
                options={[
                  { label: "Low", value: "LOW" },
                  { label: "Medium", value: "MEDIUM" },
                  { label: "High", value: "HIGH" },
                ]}
                value={priority}
                onChange={setPriority}
              />
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="col-span-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
          </div>
          {editError && <p className="text-sm text-red-500 mt-3">{editError}</p>}
          <Button onClick={handleEditSubmit} className="mt-3" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </Card>
      )}

      {/* Kanban Board */}
      {tasks.length === 0 ? (
        <div className="text-center text-gray-400 mt-12">
          <p className="text-base font-medium">No tasks in this project yet.</p>
          {(isAdmin || (isPM && isProjectOwner)) && (
            <p className="text-sm mt-1">Click &ldquo;New Task&rdquo; to create one.</p>
          )}
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          canEdit={canEditTasks}
          canManageTask={isAdmin || isProjectOwner}
          onStatusChange={handleStatusChange}
          onEdit={handleEditOpen}
        />
      )}
    </div>
  );
}