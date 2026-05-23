/**
 * Admin Page
 * User management panel for admin role.
 */
import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { userAPI } from "../services/api";
import {
  Shield,
  Users,
  UserCheck,
  UserX,
  Loader2,
  ChevronDown,
  UserPlus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import type { User } from "../types";

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  editor: "bg-blue-100 text-blue-700",
  viewer: "bg-zinc-800/50 text-zinc-300",
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer",
    organisation: "",
  });

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await userAPI.list({ limit: 100 });
      setUsers(data.data.users);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (
    userId: string,
    newRole: string,
  ): Promise<void> => {
    setUpdatingId(userId);
    try {
      await userAPI.updateRole(userId, newRole);
      toast.success("Role updated.");
      fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to update role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: string): Promise<void> => {
    setUpdatingId(userId);
    try {
      const { data } = await userAPI.toggleStatus(userId);
      toast.success(data.message);
      fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(
        axiosErr.response?.data?.message || "Failed to update status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setCreating(true);
    try {
      await userAPI.create(formData);
      toast.success("User created successfully!");
      setShowCreateModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "viewer",
        organisation: "",
      });
      fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to create user.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Admin Panel</h1>
            <p className="text-zinc-500">Manage users and roles</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <UserPlus size={18} />
          Create User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900/80 rounded-xl border border-zinc-700 p-4 text-center">
          <Users size={24} className="mx-auto text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-sm text-zinc-500">Total Users</p>
        </div>
        <div className="bg-zinc-900/80 rounded-xl border border-zinc-700 p-4 text-center">
          <UserCheck size={24} className="mx-auto text-green-600 mb-2" />
          <p className="text-2xl font-bold">
            {users.filter((u) => u.isActive).length}
          </p>
          <p className="text-sm text-zinc-500">Active</p>
        </div>
        <div className="bg-zinc-900/80 rounded-xl border border-zinc-700 p-4 text-center">
          <UserX size={24} className="mx-auto text-red-500 mb-2" />
          <p className="text-2xl font-bold">
            {users.filter((u) => !u.isActive).length}
          </p>
          <p className="text-sm text-zinc-500">Inactive</p>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-zinc-900/80 rounded-xl border border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-700">
                <th className="text-left px-5 py-3 font-medium text-zinc-500">
                  User
                </th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500">
                  Email
                </th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500">
                  Organisation
                </th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500">
                  Role
                </th>
                <th className="text-left px-5 py-3 font-medium text-zinc-500">
                  Status
                </th>
                <th className="text-right px-5 py-3 font-medium text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-zinc-900/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-zinc-100">
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-zinc-400">{u.email}</td>
                  <td className="px-5 py-3 text-zinc-400">{u.organisation}</td>
                  <td className="px-5 py-3">
                    <div className="relative">
                      <select
                        value={u.role}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          handleRoleChange(u._id, e.target.value)
                        }
                        disabled={updatingId === u._id}
                        className={`appearance-none pl-3 pr-7 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${roleColors[u.role]}`}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <ChevronDown
                        size={12}
                        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                      />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(u._id)}
                      disabled={updatingId === u._id}
                      className={`text-xs font-medium px-3 py-1 rounded-xl transition-colors ${
                        u.isActive
                          ? "text-red-600 hover:bg-red-50"
                          : "text-green-600 hover:bg-green-50"
                      } disabled:opacity-50`}
                    >
                      {updatingId === u._id ? (
                        <Loader2 size={14} className="animate-spin inline" />
                      ) : u.isActive ? (
                        "Deactivate"
                      ) : (
                        "Activate"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-zinc-700">
              <h2 className="text-xl font-bold text-zinc-100">Create New User</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Organisation (Optional)
                </label>
                <input
                  type="text"
                  value={formData.organisation}
                  onChange={(e) =>
                    setFormData({ ...formData, organisation: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="Company Name"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
