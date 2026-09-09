import React, { useEffect, useState } from 'react';
import { Users, Shield, CheckCircle } from 'lucide-react';
import API from '../../services/api';
import { formatDate } from '../../utils/formatters';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleRole = async (u) => {
    const targetId = u.id || u._id;
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await API.put(`/admin/users/${targetId}`, { role: newRole });
      loadUsers();
    } catch (err) {
      alert('Role update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Registered User Accounts</h2>
        <p className="text-xs text-slate-400">View user details, role permissions, and status.</p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Joined Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">No users found.</td>
              </tr>
            ) : (
              users.map((u) => {
                const userId = u.id || u._id;
                const avatar = u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                return (
                  <tr key={userId} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img src={avatar} alt={u.name} className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
                      <span className="font-bold text-white">{u.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        u.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleRole(u)}
                        className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                      >
                        Toggle Role ({u.role === 'admin' ? 'Demote' : 'Promote'})
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
