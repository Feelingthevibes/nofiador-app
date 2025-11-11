import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';

const AdminView: React.FC = () => {
    const { user, fetchAllUsers, deleteUserByAdmin } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await fetchAllUsers();
        if (fetchError) {
            setError(fetchError.message);
        } else if (data) {
            setUsers(data);
        }
        setLoading(false);
    }, [fetchAllUsers]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleDelete = async (userIdToDelete: string) => {
        if (userIdToDelete === user?.id) {
            alert("You cannot delete your own admin account.");
            return;
        }

        if (window.confirm(`Are you sure you want to delete this user's profile? This action cannot be undone.`)) {
            const { error: deleteError } = await deleteUserByAdmin(userIdToDelete);
            if (deleteError) {
                alert(`Failed to delete user: ${deleteError.message}`);
            } else {
                setUsers(prevUsers => prevUsers.filter(u => u.id !== userIdToDelete));
                alert('User profile deleted successfully.');
            }
        }
    };

    if (loading) {
        return <div className="text-center p-12">Loading users...</div>;
    }

    if (error) {
        return <div className="text-center p-12 text-red-500">Error fetching users: {error}. Please ensure RLS policies on the 'profiles' table allow admins to read all records.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold text-brand-dark mb-6">Admin Dashboard - User Management</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Phone</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(userProfile => (
                            <tr key={userProfile.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500" title={userProfile.id}>{userProfile.id.substring(0,8)}...</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userProfile.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userProfile.contact_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userProfile.contact_phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(userProfile.id)}
                                        className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                                        disabled={userProfile.id === user?.id}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {users.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">
                        No user profiles found.
                    </div>
                 )}
            </div>
             <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 text-sm">
                <p><strong>Admin Note:</strong> Deleting a user here removes their profile data from the `profiles` table. It does <strong>not</strong> remove their authentication account from Supabase Auth. For full user deletion, a Supabase Edge Function with service-level privileges is required.</p>
            </div>
        </div>
    );
};

export default AdminView;