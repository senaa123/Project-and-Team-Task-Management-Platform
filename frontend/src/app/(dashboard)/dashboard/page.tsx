"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Task } from "@/types";
import { Bell } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [myTasks, setMyTasks] = useState<Task[]>([]);

  const [adminData, setAdminData] = useState<any>(null);

  const isAdminOrPM = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  useEffect(() => {
    if (!user) return;
    
    if (isAdminOrPM) {
      api.get("/dashboard/admin").then((res) => setAdminData(res.data)).catch(console.error);
    } else {
      api.get("/tasks/my").then((res) => setMyTasks(res.data)).catch(console.error);
    }
  }, [isAdminOrPM, user]);

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    try {
      await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
      setMyTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    } catch (error) {
      console.error("Failed to update task status", error);
    }
  };

  const { doneCount, progressPct, statusCounts } = useMemo(() => {
    const counts: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
    myTasks.forEach((t) => (counts[t.status] = (counts[t.status] ?? 0) + 1));
    const done = counts.DONE || 0;
    const total = myTasks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { doneCount: done, progressPct: pct, statusCounts: counts };
  }, [myTasks]);

  const maxCount = Math.max(1, ...Object.values(statusCounts));
  const remainingCount = myTasks.length - doneCount;

  const assignmentsList = [...myTasks]
    .sort((a, b) => {
      if (a.status === "DONE" && b.status !== "DONE") return 1;
      if (a.status !== "DONE" && b.status === "DONE") return -1;
      return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
    })
    .slice(0, 10);

  return (
    <div className="flex w-full h-screen bg-white text-gray-800">
      <div className="flex-1 flex flex-col py-8 px-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 mb-1">
              Hi, {user?.name ?? "User"}
            </h1>
            <p className="text-[13px] text-gray-500 font-medium">Let&rsquo;s finish your tasks today!</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-center justify-center hover:bg-gray-50 transition relative">
            <Bell size={20} className="text-gray-400" />
            {!isAdminOrPM && remainingCount > 0 && <span className="absolute top-2 right-[9px] w-2 h-2 bg-[#F97316] rounded-full border border-white"></span>}
          </button>
        </div>

        {/* Hero Section */}
        <div className="bg-[#F2EFFE] rounded-[24px] p-8 flex items-center justify-between relative overflow-hidden mb-8 shadow-sm shrink-0">
          <div className="relative z-10">
            <h2 className="text-[28px] font-bold text-gray-900 mb-2">Workspace Overview</h2>
            <p className="text-[#8C6AE6] text-[13px] font-bold mb-6">
              {isAdminOrPM ? "Monitor overall project progress and team performance." : `You have ${remainingCount} tasks remaining to be done.`}
            </p>
            <button className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-dark transition shadow-md">
              View schedule
            </button>
          </div>
          <div className="absolute right-0 bottom-0 h-[140%] w-auto translate-y-6 mr-10">
            <Image src="/hero.png" alt="Hero" width={280} height={280} className="object-contain" priority />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-6 min-h-[300px] mb-8">
          {isAdminOrPM && adminData ? (
            <>
              {/* Projects Progress */}
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="font-bold text-gray-900 text-base">Project Progress</h3>
                </div>
                <div className="flex flex-col gap-4 bg-white border border-gray-100 rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1 overflow-y-auto">
                  {adminData.projectProgress.length === 0 && <p className="text-sm text-gray-400">No projects found.</p>}
                  {adminData.projectProgress.map((p: any) => (
                    <div key={p.id} className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-800">{p.name}</span>
                        <span className="text-gray-500">{p.completionPercentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${p.completionPercentage}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{p.doneTasks} of {p.totalTasks} tasks completed</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              <div className="flex flex-col h-full">
                <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-base mb-4">Top Performers</h3>
                  <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                    {adminData.topPerformers.length === 0 ? (
                      <p className="text-sm text-gray-400 font-medium text-center py-4">No completed tasks yet.</p>
                    ) : (
                      adminData.topPerformers.map((user: any, idx: number) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center font-bold">
                              #{idx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email} {user.empId ? `(${user.empId})` : ''}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold text-primary">{user.doneCount}</span>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Done</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : !isAdminOrPM ? (
            <>
              {/* Tasks Progress (Team Member) */}
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="font-bold text-gray-900 text-base">Your Task Progress</h3>
                </div>
                
                <div className="flex gap-6 bg-white border border-gray-100 rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1">
                  <div className="flex-1 flex items-end justify-between pr-6 border-r border-gray-100 pb-2">
                     {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((status, idx) => {
                       const count = statusCounts[status] || 0;
                       const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                       const colors = ["bg-gray-300", "bg-blue-400", "bg-orange-400", "bg-primary"];
                       return (
                         <div key={idx} className="flex flex-col items-center gap-3 h-full justify-end">
                           <div className="w-4 h-[140px] bg-gray-100 rounded-full flex items-end relative overflow-hidden">
                              <div className={`w-full ${colors[idx]} rounded-full absolute bottom-0 transition-all`} style={{height: `${height}%`}} />
                           </div>
                           <span className="text-[9px] text-gray-400 font-bold">{status.replace("_", " ")}</span>
                           <span className="text-xs font-bold text-gray-800">{count}</span>
                         </div>
                       );
                     })}
                  </div>
                  
                  <div className="flex flex-col justify-center w-24 py-1 gap-6">
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold mb-1">Total Tasks</p>
                      <span className="text-xl font-bold text-gray-900">{myTasks.length}</span>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold mb-1">Completed</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">{doneCount}</span>
                        <span className="text-[10px] font-bold bg-[#F2EFFE] text-primary px-1.5 py-0.5 rounded">{progressPct}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignments (Team Member) */}
              <div className="flex flex-col h-full">
                <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-base mb-1">Your Assignments</h3>
                  <div className="text-[11px] text-[#F97316] font-bold mb-5 flex items-center gap-1.5">
                     <span className="w-3 h-3 rounded-full bg-[#F97316] text-white flex items-center justify-center text-[8px]">✓</span>
                     {doneCount}/{myTasks.length} completed
                  </div>
                  
                  <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                    {assignmentsList.length === 0 ? (
                      <p className="text-sm text-gray-400 font-medium text-center py-4">No tasks assigned to you yet.</p>
                    ) : (
                      assignmentsList.map((task) => {
                        const isDone = task.status === "DONE";
                        return (
                          <div key={task.id} className="flex items-start justify-between cursor-pointer group" onClick={() => handleToggleTask(task)}>
                            <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                              <div className={`w-[18px] h-[18px] mt-0.5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-[#F2EFFE] border-primary text-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                {isDone && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <div className="min-w-0">
                                <p className={`font-bold text-[13px] truncate transition-colors ${isDone ? 'text-gray-400 line-through' : 'text-gray-900 group-hover:text-primary'}`}>{task.title}</p>
                                <p className="text-[11px] text-gray-400 font-bold truncate">{task.description || "No description"}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`font-bold text-[10px] px-2 py-1 rounded-full ${isDone ? 'bg-gray-100 text-gray-500' : 'bg-primary-50 text-primary'}`}>{task.status.replace("_", " ")}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-2 text-center text-sm text-gray-400 p-8">Loading dashboard...</div>
          )}
        </div>
      </div>
    </div>
  );
}