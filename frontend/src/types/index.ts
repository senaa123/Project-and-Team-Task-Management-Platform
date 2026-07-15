export interface User {
  id: string;
  empId?: string;
  name: string;
  email: string;
  role: string;
  isVerified?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  owner?: { id: string; name: string; email: string; empId: string };
  members?: { user: { id: string; name: string; email: string; empId: string } }[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: string;
  assigneeId: string | null;
  dueDate: string | null;
  assignee?: { id: string; name: string; empId: string | null };
}