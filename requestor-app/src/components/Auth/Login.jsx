import React, { useMemo, useState } from 'react';
import API from '../../services/api';
import loginBg from '../../assets/login-bg.jpg';
import gcgLogo from '../../assets/gcg-logo.png';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('demo@gcg.com');
    const [password, setPassword] = useState('password');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Create Account modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        fullName: '',
        email: '',
        contactNumber: '',
        idNumber: '',
        role: '',
        department: '',
    });
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');

    const resetCreateForm = () => {
        setCreateForm({
            fullName: '',
            email: '',
            contactNumber: '',
            idNumber: '',
            role: '',
            department: '',
        });
        setCreateError('');
        setCreateSuccess('');
    };

    const openCreateModal = () => {
        resetCreateForm();
        setShowCreateModal(true);
    };

    const closeCreateModal = () => setShowCreateModal(false);

    const updateCreateField = (key, value) => {
        setCreateForm((prev) => ({ ...prev, [key]: value }));
    };

    const createFormIsValid = useMemo(() => {
        const f = createForm;
        return (
            f.fullName.trim() &&
            f.email.trim() &&
            f.contactNumber.trim() &&
            f.idNumber.trim() &&
            f.role.trim() &&
            f.department.trim()
        );
    }, [createForm]);

    const handleCreateAccount = (e) => {
        e.preventDefault();
        setCreateError('');
        setCreateSuccess('');

        if (!createFormIsValid) {
            setCreateError('Please fill out all fields.');
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(createForm.email.trim())) {
            setCreateError('Please enter a valid email.');
            return;
        }

        if (createForm.contactNumber.trim().length < 7) {
            setCreateError('Please enter a valid contact number.');
            return;
        }

        // ✅ Mailto admin (frontend only)
        const adminEmail = 'admin@gcg.com'; // TODO: replace with real admin email
        const subject = encodeURIComponent('New Account Request - GCG Ticketing');

        const body = encodeURIComponent(
            `Hello Admin,

I would like to request a new account for GCG Ticketing.

Here are my details:

Full Name: ${createForm.fullName}
Email: ${createForm.email}
Contact Number: ${createForm.contactNumber}
ID Number: ${createForm.idNumber}
Role: ${createForm.role}
Department: ${createForm.department}

Thank you!`
        );

        const mailtoLink = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');
        setCreateSuccess('Opening your email client...');
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await API.login({ email, password });
            if (result.success) {
                localStorage.setItem('user', JSON.stringify(result.user));
                // Store accountId if available
                if (result.user && result.user.account_id) {
                    localStorage.setItem('accountId', result.user.account_id);
                }
                // Store token
                if (result.accessToken) {
                    localStorage.setItem('token', result.accessToken);
                } else if (result.token) {
                    localStorage.setItem('token', result.token);
                }
                onLogin(result.user);
            } else {
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${loginBg})`,
                backgroundSize: 'contain',
            }}
        >
            {/* subtle overlay so the card reads well */}
            <div className="min-h-screen flex items-center justify-center bg-black/40 px-5 py-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-lg w-full mx-auto border border-white/30">
                    <div className="text-center mb-8">
                        {/* ✅ logo replacing the blue ticket square */}
                        <div className="flex justify-center mb-4">
                            <img
                                src={gcgLogo}
                                alt="GCG Logo"
                                className="w-40 object-contain"
                            />
                        </div>

                        <div className="text-2xl font-bold text-gray-900">GCG Ticketing</div>
                        <div className="text-sm text-gray-700 font-medium mt-1">
                            Requestor Mobile App
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 mb-3 text-center text-sm font-semibold bg-red-50 py-2 px-3 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* ✅ Email Login only */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md transition active:scale-[0.99] disabled:opacity-70"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-circle-notch fa-spin"></i> Logging in...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt"></i> Login
                                </>
                            )}
                        </button>

                        <div className="text-center text-sm text-gray-700">
                            Don&apos;t have an account yet?{" "}
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Click here
                            </button>{" "}
                            to contact admin and create one.
                        </div>

                        <div className="mt-4 text-center text-sm text-gray-700 font-medium bg-gray-50 py-2 px-3 rounded-lg border border-gray-200">
                            Demo: demo@gcg.com / password
                        </div>
                    </form>
                </div>

                {/* Create Account Modal */}
                {showCreateModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) closeCreateModal();
                        }}
                    >
                        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <div className="text-lg font-bold text-gray-900">Create Account</div>
                                <div className="text-xs text-gray-600 mt-1">
                                    Kindly fill out the form to create your account and an administrator will get back with you shortly.
                                </div>
                            </div>

                            <form onSubmit={handleCreateAccount} className="px-6 py-5 space-y-4">
                                {createError && (
                                    <div className="text-red-700 text-sm font-semibold bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                                        {createError}
                                    </div>
                                )}
                                {createSuccess && (
                                    <div className="text-emerald-800 text-sm font-semibold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                                        {createSuccess}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        value={createForm.fullName}
                                        onChange={(e) => updateCreateField('fullName', e.target.value)}
                                        placeholder="Juan Dela Cruz"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        value={createForm.email}
                                        onChange={(e) => updateCreateField('email', e.target.value)}
                                        placeholder="email@email.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Contact Number
                                    </label>
                                    <input
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        value={createForm.contactNumber}
                                        onChange={(e) => updateCreateField('contactNumber', e.target.value)}
                                        placeholder="09999999999"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        ID Number
                                    </label>
                                    <input
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        value={createForm.idNumber}
                                        onChange={(e) => updateCreateField('idNumber', e.target.value)}
                                        placeholder="ID Number"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Role
                                    </label>
                                    <input
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        value={createForm.role}
                                        onChange={(e) => updateCreateField('role', e.target.value)}
                                        placeholder="Role"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Department
                                    </label>
                                    <input
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        value={createForm.department}
                                        onChange={(e) => updateCreateField('department', e.target.value)}
                                        placeholder="Department"
                                        required
                                    />
                                </div>

                                <div className="pt-2 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={closeCreateModal}
                                        className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-60"
                                        disabled={!createFormIsValid}
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;