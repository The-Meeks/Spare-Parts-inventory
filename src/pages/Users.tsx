import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus,
  Loader2,
  Mail,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button,
  Badge
} from '../components/UI';
import { getUsers, updateUserRole } from '../services/firestoreService';
import { UserProfile, UserRole } from '../types';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export const Users: React.FC = () => {
  const { profile: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data as UserProfile[]);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === currentUser?.id) {
      alert("You cannot change your own role!");
      return;
    }

    setUpdatingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="font-medium">Loading user profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Management</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage user permissions and access levels.</p>
        </div>
        <div className="flex items-center gap-4 bg-indigo-50 p-2 rounded-2xl border border-indigo-100">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <ShieldCheck size={24} />
          </div>
          <div className="pr-4">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Security Status</p>
            <p className="text-sm font-bold text-indigo-900">RBAC Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-y border-slate-100">
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <motion.tr 
                    layout
                    key={user.id} 
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase text-sm group-hover:scale-110 transition-transform">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === UserRole.ADMIN ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold ring-1 ring-purple-200 ring-inset">
                            <ShieldAlert size={12} />
                            Administrator
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold ring-1 ring-blue-200 ring-inset">
                            <UsersIcon size={12} />
                            Staff Member
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium whitespace-nowrap">
                        <Calendar size={14} className="text-slate-400" />
                        {user.createdAt?.seconds 
                          ? format(new Date(user.createdAt.seconds * 1000), 'MMM dd, yyyy') 
                          : 'Recent'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.id !== currentUser?.id && (
                        <div className="flex justify-end gap-2">
                          {updatingId === user.id ? (
                            <Loader2 className="animate-spin text-slate-400" size={20} />
                          ) : (
                            <div className="flex gap-1 overflow-hidden rounded-lg border border-slate-200">
                              <button
                                onClick={() => handleRoleChange(user.id, UserRole.ADMIN)}
                                className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                                  user.role === UserRole.ADMIN 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                Admin
                              </button>
                              <div className="w-[1px] bg-slate-200" />
                              <button
                                onClick={() => handleRoleChange(user.id, UserRole.STAFF)}
                                className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                                  user.role === UserRole.STAFF 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                Staff
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {user.id === currentUser?.id && (
                        <span className="text-xs font-bold text-slate-400 uppercase italic">Your Account</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
