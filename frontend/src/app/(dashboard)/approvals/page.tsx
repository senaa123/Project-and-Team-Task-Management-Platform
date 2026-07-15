"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { User } from "@/types";
import { Check, X } from "lucide-react";
import Button from "@/components/ui/Button";
import CustomSelect from "@/components/ui/CustomSelect";

function ApprovalRow({ u, onApprove }: { u: User; onApprove: (id: string, role: string) => void }) {
  const [role, setRole] = useState("TEAM_MEMBER");

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="p-4 text-sm font-medium text-gray-900">{u.empId || "N/A"}</td>
      <td className="p-4 text-sm text-gray-700">{u.name}</td>
      <td className="p-4 text-sm text-gray-500">{u.email}</td>
      <td className="p-4">
        <div className="flex items-center gap-3">
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
        </div>
      </td>
    </tr>
  );
}

export default function ApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get("/users/pending");
      setPendingUsers(res.data);
    } catch (err: any) {
      setError("Failed to fetch pending users.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, role: string) => {
    try {
      await api.patch(`/users/${id}/verify`, { role });
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("Failed to verify user.");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex w-full h-screen bg-white text-gray-800 p-8 overflow-y-auto">
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
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
                  <ApprovalRow key={u.id} u={u} onApprove={handleApprove} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
