"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { User } from "@/types";
import Button from "@/components/ui/Button";
import CustomSelect from "@/components/ui/CustomSelect";

function ApprovalRow({
  u,
  onApprove,
  onReject,
}: {
  u: User;
  onApprove: (id: string, role: string) => void;
  onReject: (id: string) => void;
}) {
  const [role, setRole] = useState("TEAM_MEMBER");
  const [confirming, setConfirming] = useState(false);

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="p-4 text-sm font-medium text-gray-900">{u.empId || "N/A"}</td>
      <td className="p-4 text-sm text-gray-700">{u.name}</td>
      <td className="p-4 text-sm text-gray-500">{u.email}</td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          {!confirming ? (
            <>
              <div className="w-48">
                <CustomSelect
                  options={[
                    { label: "Project Manager", value: "PROJECT_MANAGER" },
                    { label: "Team Member", value: "TEAM_MEMBER" },
                  ]}
                  value={role}
                  onChange={setRole}
                />
              </div>
              <Button
                onClick={() => onApprove(u.id, role)}
                className="py-1.5 px-4 h-auto text-sm"
              >
                Approve
              </Button>
              <button
                onClick={() => setConfirming(true)}
                className="py-2.5 px-4 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition focus:outline-none"
              >
                Reject
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Remove this registration?</span>
              <button
                onClick={() => onReject(u.id)}
                className="py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 transition focus:outline-none"
              >
                Yes, remove
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="py-2.5 px-4 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition focus:outline-none"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function ApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Declare before useEffect so it's in scope when the effect runs
  const fetchPending = async () => {
    try {
      const res = await api.get("/users/pending");
      setPendingUsers(res.data);
    } catch {
      setError("Failed to fetch pending users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPending();
  }, []);

  const handleApprove = async (id: string, role: string) => {
    try {
      await api.patch(`/users/${id}/verify`, { role });
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Failed to verify user.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Failed to reject user.");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex w-full h-full bg-white text-gray-800 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-5xl w-full mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Approvals</h1>
        <p className="text-sm text-gray-500 mb-8">Review and verify new employee registrations.</p>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {pendingUsers.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 text-center">
            <h3 className="text-gray-900 font-bold mb-2">All caught up!</h3>
            <p className="text-gray-500 text-sm">There are no pending registrations at the moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto pb-48">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Emp ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingUsers.map((u) => (
                  <ApprovalRow key={u.id} u={u} onApprove={handleApprove} onReject={handleReject} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
