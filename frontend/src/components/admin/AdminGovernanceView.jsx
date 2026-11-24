import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Building2,
  BellRing,
  ScrollText,
  Key,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  Send,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Lock,
  LogOut,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { apiService } from '../../services/api';

export default function AdminGovernanceView() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('users');
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: '' });
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'Analyst' });

  // Bank registry state
  const [managedBanks, setManagedBanks] = useState({ canonical_count: 16, custom_count: 0, institutions: [] });
  const [newBank, setNewBank] = useState({ brand_name: '', primary_domain: '', category: 'Commercial Bank' });

  // Webhooks state
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', is_active: true, secret_token: '' });

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState({ total: 0, logs: [] });
  const [auditFilter, setAuditFilter] = useState('');

  // Status/Toast messages
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkSession = async () => {
    try {
      const user = await apiService.getMe();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await apiService.login(loginForm.username, loginForm.password);
      setCurrentUser(res.user);
      setActionMessage(`Authenticated as ${res.user.role}: ${res.user.username}`);
      loadTabData(activeSubTab);
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Authentication failed. Check credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
    setActionMessage('Session terminated.');
  };

  const loadTabData = async (tab) => {
    setIsLoading(true);
    setActionError(null);
    try {
      if (tab === 'users') {
        const u = await apiService.listAdminUsers();
        setUsers(Array.isArray(u) ? u : []);
      } else if (tab === 'banks') {
        const b = await apiService.listManagedBanks();
        setManagedBanks(b || { institutions: [] });
      } else if (tab === 'webhooks') {
        const w = await apiService.listWebhooks();
        setWebhooks(Array.isArray(w) ? w : []);
      } else if (tab === 'audit') {
        const a = await apiService.getAuditLogs({ limit: 50 });
        setAuditLogs(a || { logs: [] });
      }
    } catch (err) {
      setActionError(err.response?.data?.detail || `Failed to load ${tab} data.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'Administrator') {
      loadTabData(activeSubTab);
    }
  }, [activeSubTab, currentUser]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await apiService.createAdminUser(newUser);
      setActionMessage(`User '${newUser.username}' created successfully.`);
      setNewUser({ username: '', email: '', password: '', role: 'Analyst' });
      loadTabData('users');
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to create user.');
    }
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      await apiService.addManagedBank({
        ...newBank,
        official_domains: [newBank.primary_domain],
        keywords: [newBank.brand_name.toLowerCase()]
      });
      setActionMessage(`Institution '${newBank.brand_name}' added to whitelist.`);
      setNewBank({ brand_name: '', primary_domain: '', category: 'Commercial Bank' });
      loadTabData('banks');
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to add banking institution.');
    }
  };

  const handleDeleteBank = async (id, brandName) => {
    if (!window.confirm(`Are you sure you want to remove '${brandName}' from the custom whitelist?`)) return;
    try {
      await apiService.deleteManagedBank(id);
      setActionMessage(`Removed '${brandName}' from whitelist.`);
      loadTabData('banks');
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to remove custom institution.');
    }
  };

  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    try {
      await apiService.createWebhook(newWebhook);
      setActionMessage(`Alert webhook '${newWebhook.name}' configured.`);
      setNewWebhook({ name: '', url: '', is_active: true, secret_token: '' });
      loadTabData('webhooks');
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to configure webhook. Check SSRF requirements.');
    }
  };

  const handleTestWebhook = async (id, name) => {
    try {
      const res = await apiService.testWebhook(id);
      setActionMessage(`Webhook '${name}' ping successful (HTTP ${res.http_code}).`);
      loadTabData('webhooks');
    } catch (err) {
      setActionError(err.response?.data?.detail || `Webhook test failed for '${name}'.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E2E8F0]">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#1D4ED8]" />
            <h2 className="text-lg font-bold text-[#0F172A] tracking-wide">Enterprise Governance & Administration</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
              PHASE 6C
            </span>
          </div>
          <p className="text-xs text-[#475569] mt-1">
            Role-Based Access Control, Dynamic Institution Whitelist, Egress Webhooks, and Audit Provenance.
          </p>
        </div>

        {/* Current Session Badge */}
        {currentUser ? (
          <div className="flex items-center space-x-3 bg-[#F8FAFC] px-3.5 py-2 rounded-lg border border-[#E2E8F0]">
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#0F172A] font-mono font-semibold">{currentUser.username}</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#EFF6FF] text-[#1D4ED8]">
                {currentUser.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-[#475569] hover:text-[#991B1B] p-1 transition-colors"
              title="Logout Session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-[#92400E] font-mono flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
            <Lock className="w-3.5 h-3.5" /> Unauthenticated (Guest Mode)
          </span>
        )}
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[#065F46] text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-[#475569] hover:text-[#0F172A] text-xs">✕</button>
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[#991B1B] text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-[#475569] hover:text-[#0F172A] text-xs">✕</button>
        </div>
      )}

      {/* Unauthenticated View: Login Modal */}
      {!currentUser && (
        <div className="max-w-md mx-auto p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-4 shadow-sm">
          <div className="text-center space-y-1">
            <Key className="w-8 h-8 text-[#1D4ED8] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-mono">
              Administrator Authentication
            </h3>
            <p className="text-xs text-[#475569]">
              Enter credentials to access user management, audit trails, and bank registry governance.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-[11px] font-mono text-[#475569] block mb-1">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-[#475569] block mb-1">Password</label>
              <input
                type="password"
                placeholder="Default: PhishShieldAdmin#2026"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
                required
              />
            </div>

            {loginError && <p className="text-xs text-[#991B1B]">{loginError}</p>}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="cyber-btn-primary w-full py-2 text-xs"
            >
              {isLoggingIn ? 'Verifying Credentials...' : 'Authenticate Session'}
            </button>
          </form>
        </div>
      )}

      {/* Authenticated Admin Console */}
      {currentUser && (
        <div className="space-y-4">
          {/* Sub-tab Navigation */}
          <div className="flex border-b border-[#E2E8F0] gap-2">
            {[
              { id: 'users', label: 'User Governance & RBAC', icon: Users },
              { id: 'banks', label: 'Whitelist Registry Administration', icon: Building2 },
              { id: 'webhooks', label: 'Alert Webhooks (SSRF Protected)', icon: BellRing },
              { id: 'audit', label: 'Security Audit Trail', icon: ScrollText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${isActive
                    ? 'border-[#1D4ED8] text-[#1D4ED8] bg-[#EFF6FF]'
                    : 'border-transparent text-[#475569] hover:text-[#0F172A]'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: USERS */}
          {activeSubTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl bg-white border border-[#E2E8F0] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                    Registered Users ({users.length})
                  </h3>
                  <button onClick={() => loadTabData('users')} className="text-xs text-[#475569] hover:text-[#0F172A]">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-[#475569]">
                        <th className="pb-2">User</th>
                        <th className="pb-2">Role</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Last Login</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] font-mono text-[11px]">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 text-[#0F172A] font-semibold">{u.username}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${u.role === 'Administrator' ? 'bg-rose-500/20 text-[#991B1B]' :
                              u.role === 'Analyst' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-[#334155]'
                              }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${u.is_active ? 'bg-emerald-500/20 text-[#065F46]' : 'bg-rose-500/20 text-[#991B1B]'}`}>
                              {u.is_active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="py-2.5 text-[#475569]">{u.last_login ? new Date(u.last_login).toLocaleTimeString() : 'Never'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Create User Form */}
              <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono mb-3">
                  Provision New User
                </h3>
                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#475569] block mb-1">Username</label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#475569] block mb-1">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#475569] block mb-1">Password</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
                      placeholder="Min 8 characters"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#475569] block mb-1">Role Assignment</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
                    >
                      <option value="Viewer">Viewer (Read-only)</option>
                      <option value="Analyst">Analyst (Scans & Exports)</option>
                      <option value="Administrator">Administrator (Full Control)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="cyber-btn-primary w-full py-2 text-xs mt-2"
                  >
                    Create User Account
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: BANK REGISTRY */}
          {activeSubTab === 'banks' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl bg-white border border-[#E2E8F0] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                      Whitelist Institutions ({managedBanks.total_institutions || managedBanks.institutions?.length || 0})
                    </h3>
                    <p className="text-[11px] text-[#475569] mt-0.5">
                      16 Canonical Core Banks are protected from deletion.
                    </p>
                  </div>
                  <button onClick={() => loadTabData('banks')} className="text-xs text-[#475569] hover:text-[#0F172A]">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="max-h-[450px] overflow-y-auto space-y-2 pr-1">
                  {managedBanks.institutions?.map((b, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-[#0F172A]">{b.brand_name}</span>
                          {b.is_custom ? (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-[#065F46]">CUSTOM</span>
                          ) : (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8]">CANONICAL</span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-[#1D4ED8] mt-0.5">{b.primary_domain}</p>
                      </div>
                      {b.is_custom && (
                        <button
                          onClick={() => handleDeleteBank(b.id, b.brand_name)}
                          className="text-xs text-[#475569] hover:text-[#991B1B] p-1 transition-colors"
                          title="Remove custom whitelist entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom Bank Form */}
              <div className="rounded-xl bg-white border border-[#E2E8F0] p-5">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono mb-3">
                  Add Approved Institution
                </h3>
                <form onSubmit={handleAddBank} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#475569] block mb-1">Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Bandhan Bank"
                      value={newBank.brand_name}
                      onChange={(e) => setNewBank({ ...newBank, brand_name: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#475569] block mb-1">Primary Domain (FQDN)</label>
                    <input
                      type="text"
                      placeholder="e.g. bandhanbank.com"
                      value={newBank.primary_domain}
                      onChange={(e) => setNewBank({ ...newBank, primary_domain: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
                      required
                    />
                    <p className="text-[10px] text-[#64748B] mt-1">No protocols (https://) or wildcards (*).</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#475569] block mb-1">Category</label>
                    <input
                      type="text"
                      value={newBank.category}
                      onChange={(e) => setNewBank({ ...newBank, category: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
                    />
                  </div>
                  <button
                    type="submit"
                    className="cyber-btn-primary w-full py-2 text-xs mt-2"
                  >
                    Add Institution to Registry
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: WEBHOOKS */}
          {activeSubTab === 'webhooks' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl bg-white border border-[#E2E8F0] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                      Outbound Alert Destinations ({webhooks.length})
                    </h3>
                    <p className="text-[11px] text-[#475569] mt-0.5">
                      SSRF Defense enforces strict HTTPS & blocks private networks / loopbacks.
                    </p>
                  </div>
                  <button onClick={() => loadTabData('webhooks')} className="text-xs text-[#475569] hover:text-[#0F172A]">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="space-y-3">
                  {webhooks.length === 0 ? (
                    <p className="text-xs text-[#64748B] py-4 text-center">No alert webhooks configured.</p>
                  ) : (
                    webhooks.map((w) => (
                      <div key={w.id} className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0F172A]">{w.name}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleTestWebhook(w.id, w.name)}
                              className="px-2 py-1 rounded bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-mono hover:bg-blue-100 transition-colors"
                            >
                              Test Ping
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] font-mono text-[#475569] truncate">{w.url}</p>
                        <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 border-t border-[#E2E8F0]">
                          <span>Last Delivery: {w.last_delivery_status || 'Never'}</span>
                          {w.last_error && <span className="text-[#991B1B] truncate max-w-[200px]">{w.last_error}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Webhook Form */}
              <div className="rounded-xl bg-white border border-[#E2E8F0] p-5">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono mb-3">
                  Register Alert Webhook
                </h3>
                <form onSubmit={handleCreateWebhook} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#475569] block mb-1">Destination Name</label>
                    <input
                      type="text"
                      placeholder="e.g. SOC Slack Channel"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#475569] block mb-1">Webhook URL (HTTPS Only)</label>
                    <input
                      type="url"
                      placeholder="https://hooks.slack.com/services/..."
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
                      required
                    />
                    <p className="text-[10px] text-[#64748B] mt-1">SSRF protection blocks localhost and private IPs.</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#475569] block mb-1">Secret Auth Token (Optional)</label>
                    <input
                      type="password"
                      placeholder="Bearer token or secret"
                      value={newWebhook.secret_token}
                      onChange={(e) => setNewWebhook({ ...newWebhook, secret_token: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/15"
                    />
                  </div>
                  <button
                    type="submit"
                    className="cyber-btn-primary w-full py-2 text-xs mt-2"
                  >
                    Save Webhook Config
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeSubTab === 'audit' && (
            <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                    Administrative Security Audit Logs ({auditLogs.total})
                  </h3>
                  <p className="text-[11px] text-[#475569] mt-0.5">
                    Immutable forensic log of user events, registry changes, and export actions.
                  </p>
                </div>
                <button onClick={() => loadTabData('audit')} className="text-xs text-[#475569] hover:text-[#0F172A]">
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[#475569] font-mono text-[11px]">
                      <th className="pb-2">Timestamp</th>
                      <th className="pb-2">Actor</th>
                      <th className="pb-2">Role</th>
                      <th className="pb-2">Action</th>
                      <th className="pb-2">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] font-mono text-[11px]">
                    {auditLogs.logs?.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-2 text-[#475569] whitespace-nowrap">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-2 text-[#0F172A] font-semibold">{log.actor_username}</td>
                        <td className="py-2 text-[#1D4ED8] font-medium">{log.actor_role}</td>
                        <td className="py-2 text-[#065F46] font-bold">{log.action}</td>
                        <td className="py-2 text-[#475569] max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
