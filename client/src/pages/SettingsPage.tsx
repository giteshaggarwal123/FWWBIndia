import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';

const PREF_KEY = 'fwwb-settings-prefs';

type Prefs = {
  emailApprovals: boolean;
  weeklyDigest: boolean;
  compactTables: boolean;
};

function loadPrefs(): Prefs {
  try {
    const s = localStorage.getItem(PREF_KEY);
    if (s) return JSON.parse(s) as Prefs;
  } catch { /* ignore */ }
  return { emailApprovals: true, weeklyDigest: true, compactTables: false };
}

function savePrefs(p: Prefs) {
  localStorage.setItem(PREF_KEY, JSON.stringify(p));
}

type OrgSettings = {
  name: string;
  shortName: string;
  tagline?: string;
  address?: string;
  city?: string;
  email?: string;
  phone?: string;
  website?: string;
  financialYearStart?: string;
  currentFY: string;
  currency?: string;
};

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [saved, setSaved] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);
  const [editingOrg, setEditingOrg] = useState(false);
  const [orgForm, setOrgForm] = useState<OrgSettings | null>(null);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const handleSavePrefs = () => {
    savePrefs(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const { data: orgData } = useQuery({
    queryKey: ['settings', 'organization'],
    queryFn: async () => {
      const res = await api.get<OrgSettings>('/settings/organization');
      return res.data;
    },
  });
  const { data: fyList = [] } = useQuery({
    queryKey: ['settings', 'financial-years'],
    queryFn: async () => {
      const res = await api.get<string[]>('/settings/financial-years');
      return res.data;
    },
  });
  const patchOrgMutation = useMutation({
    mutationFn: (body: Partial<OrgSettings>) => api.patch('/settings/organization', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setEditingOrg(false);
      setOrgSaved(true);
      setTimeout(() => setOrgSaved(false), 2000);
    },
  });

  const org = orgData ?? null;
  const displayOrg = editingOrg && orgForm ? orgForm : org;

  const startEditOrg = () => {
    setOrgForm(org ? { ...org } : null);
    setEditingOrg(true);
  };
  const saveOrg = () => {
    if (orgForm) patchOrgMutation.mutate(orgForm);
  };
  const cancelEditOrg = () => {
    setEditingOrg(false);
    setOrgForm(null);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get<{ user: { id: string; username: string; name: string; role: string; type: string } }>('/auth/me');
      return res.data;
    },
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Settings' }]} />
      <div style={{ maxWidth: 720 }}>
        {/* Organization */}
        <section style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>Organization</h2>
          {!displayOrg && <p style={{ color: '#718096' }}>Loading...</p>}
          {displayOrg && (
            <>
              {!editingOrg ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div><strong style={{ color: '#2E3192' }}>{displayOrg.shortName}</strong></div>
                  <p style={{ margin: 0, color: '#4a5568' }}>{displayOrg.name}</p>
                  {displayOrg.tagline && <p style={{ margin: 0, color: '#718096', fontSize: 14 }}>{displayOrg.tagline}</p>}
                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />
                  <div>
                    <strong style={{ fontSize: 13, color: '#4a5568' }}>Address</strong>
                    <p style={{ margin: '4px 0 0', color: '#4a5568' }}>{displayOrg.address || '—'}<br />{displayOrg.city || ''}</p>
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: '#4a5568' }}>Contact</strong>
                    <p style={{ margin: '4px 0 0', color: '#4a5568' }}>Email: {displayOrg.email || '—'} · Phone: {displayOrg.phone || '—'}</p>
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: '#4a5568' }}>Financial Year</strong>
                    <p style={{ margin: '4px 0 0', color: '#4a5568' }}>{displayOrg.currentFY} ({displayOrg.financialYearStart || 'April - March'})</p>
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: '#4a5568' }}>Financial years (reference)</strong>
                    <p style={{ margin: '4px 0 0', color: '#4a5568' }}>{fyList.join(' · ')}</p>
                  </div>
                  <button type="button" onClick={startEditOrg} style={{ padding: '8px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Edit organization</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label>Short name <input type="text" value={orgForm?.shortName ?? ''} onChange={(e) => setOrgForm((o) => o ? { ...o, shortName: e.target.value } : null)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
                  <label>Full name <input type="text" value={orgForm?.name ?? ''} onChange={(e) => setOrgForm((o) => o ? { ...o, name: e.target.value } : null)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
                  <label>Tagline <input type="text" value={orgForm?.tagline ?? ''} onChange={(e) => setOrgForm((o) => o ? { ...o, tagline: e.target.value } : null)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
                  <label>Address <input type="text" value={orgForm?.address ?? ''} onChange={(e) => setOrgForm((o) => o ? { ...o, address: e.target.value } : null)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
                  <label>City <input type="text" value={orgForm?.city ?? ''} onChange={(e) => setOrgForm((o) => o ? { ...o, city: e.target.value } : null)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
                  <label>Email <input type="email" value={orgForm?.email ?? ''} onChange={(e) => setOrgForm((o) => o ? { ...o, email: e.target.value } : null)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
                  <label>Phone <input type="text" value={orgForm?.phone ?? ''} onChange={(e) => setOrgForm((o) => o ? { ...o, phone: e.target.value } : null)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
                  <label>Website <input type="url" value={orgForm?.website ?? ''} onChange={(e) => setOrgForm((o) => o ? { ...o, website: e.target.value } : null)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
                  <label>Current FY <select value={orgForm?.currentFY ?? ''} onChange={(e) => setOrgForm((o) => o ? { ...o, currentFY: e.target.value } : null)} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                    {fyList.map((fy) => <option key={fy} value={fy}>{fy}</option>)}
                  </select></label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={saveOrg} disabled={patchOrgMutation.isPending} style={{ padding: '8px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>{orgSaved ? 'Saved' : patchOrgMutation.isPending ? 'Saving...' : 'Save'}</button>
                    <button type="button" onClick={cancelEditOrg} style={{ padding: '8px 16px', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Profile */}
        <section style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>Profile</h2>
          {isLoading && <p style={{ color: '#718096' }}>Loading...</p>}
          {data?.user && (
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#718096' }}>Name</span>
                <span style={{ fontWeight: 500 }}>{data.user.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#718096' }}>Username</span>
                <span>{data.user.username}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#718096' }}>Role</span>
                <span>{data.user.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ color: '#718096' }}>Type</span>
                <span>{data.user.type}</span>
              </div>
            </div>
          )}
        </section>

        {/* Preferences */}
        <section style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>Preferences</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={prefs.emailApprovals} onChange={(e) => setPrefs((p) => ({ ...p, emailApprovals: e.target.checked }))} />
              <span>Email notifications for approvals</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={prefs.weeklyDigest} onChange={(e) => setPrefs((p) => ({ ...p, weeklyDigest: e.target.checked }))} />
              <span>Weekly digest reports</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={prefs.compactTables} onChange={(e) => setPrefs((p) => ({ ...p, compactTables: e.target.checked }))} />
              <span>Compact view for data tables</span>
            </label>
          </div>
          <button type="button" onClick={handleSavePrefs} style={{ marginTop: 16, padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>{saved ? 'Saved' : 'Save preferences'}</button>
        </section>

        {/* System */}
        <section style={{ background: '#f8f9fa', padding: 24, borderRadius: 8, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>System</h2>
          <p style={{ margin: 0, color: '#718096', fontSize: 14 }}>FWWB Management System v1.0 · Integrated MIS for program, HR, finance & donor reporting</p>
        </section>
      </div>
    </div>
  );
}
