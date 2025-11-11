import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';

const AdminView: React.FC = () => {
    const { user, fetchAllUsers, deleteUserByAdmin } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

        if (window.confirm(`Are you sure you want to completely delete this user? This action will remove their login and profile permanently and cannot be undone.`)) {
            const { error: deleteError } = await deleteUserByAdmin(userIdToDelete);
            if (deleteError) {
                alert(`Failed to delete user: ${deleteError.message}`);
            } else {
                setUsers(prevUsers => prevUsers.filter(u => u.id !== userIdToDelete));
                alert('User completely deleted from the system.');
            }
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    if (loading) {
        return <div className="text-center p-12">Loading users...</div>;
    }

    if (error) {
        return <div className="text-center p-12 text-red-500">Error fetching users: {error}. Please ensure RLS policies on the 'profiles' table allow admins to read all records.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-xl">
            <div className="sm:flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-brand-dark mb-4 sm:mb-0">Admin Dashboard - User Management</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                    />
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map(userProfile => (
                            <tr key={userProfile.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{userProfile.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userProfile.contact_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userProfile.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500" title={userProfile.id}>{userProfile.id.substring(0,8)}...</td>
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
                 {filteredUsers.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">
                        {users.length > 0 ? "No users found matching your search." : "No user profiles found."}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default AdminView;