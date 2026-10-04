import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import Button from '../components/Button.jsx';
import Logo from '../components/Logo.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../hooks/useAuth.js';

function Panel({ title, value, note, wide, children }) {
  return (
    <section className={`panel${wide ? ' wide' : ''}`}>
      <h2>{title}</h2>
      {value !== undefined && <p className="figure">{value}</p>}
      {note && <p className="muted">{note}</p>}
      {children}
    </section>
  );
}

const money = (user) => `${user.business?.currency ?? ''} 0.00`;

function OwnerDashboard({ user }) {
  return (
    <div className="panels">
      <Panel title="Cash this month" value={money(user)} note="No entries yet. Voice entry arrives in the next module." />
      <Panel title="Customers owe you" value={money(user)} note="Unpaid invoices will appear here." />
      <Panel title="You owe suppliers" value={money(user)} note="Bills waiting to be paid will appear here." />
    </div>
  );
}

function AccountantDashboard() {
  return (
    <div className="panels">
      <Panel title="Clients" value="0" note="Clients you manage will appear here." />
      <Panel title="Reviews waiting" value="0" note="Entries that need your sign-off." />
      <Panel title="Reports due" value="0" note="Upcoming VAT and year-end deadlines." />
    </div>
  );
}

function BookkeeperDashboard() {
  return (
    <div className="panels">
      <Panel title="Entries to capture" value="0" note="Transactions waiting to be recorded." />
      <Panel title="To categorise" value="0" note="Entries missing an account." />
      <Panel title="Bank lines to match" value="0" note="Statement lines without a matching entry." />
    </div>
  );
}

// Calls GET /api/admin/users, which the server only allows for the admin role.
function AdminDashboard() {
  const [state, setState] = useState({ loading: true, users: [], error: '' });

  useEffect(() => {
    api.adminUsers()
      .then((d) => setState({ loading: false, users: d.users, error: '' }))
      .catch((e) => setState({ loading: false, users: [], error: e.message }));
  }, []);

  return (
    <div className="panels">
      <Panel wide title="Recent accounts">
        <Alert type="error">{state.error}</Alert>
        {state.loading ? (
          <Spinner />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Business</th></tr></thead>
              <tbody>
                {state.users.map((u) => (
                  <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.business ?? '-'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

// The dashboard shown after sign-in is chosen by the user's role.
const DASHBOARDS = {
  business_owner: { View: OwnerDashboard, heading: 'Your business at a glance' },
  accountant: { View: AccountantDashboard, heading: 'Your practice' },
  bookkeeper: { View: BookkeeperDashboard, heading: 'Your workbench' },
  admin: { View: AdminDashboard, heading: 'Administration' },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { View, heading } = DASHBOARDS[user.role] ?? DASHBOARDS.business_owner;

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="topbar">
        <Logo />
        <div className="topbar-user">
          <span>{user.firstName} {user.lastName}</span>
          <span className="badge">{user.roleLabel}</span>
          <Button variant="ghost" onClick={signOut}>Sign out</Button>
        </div>
      </header>
      <main className="app-main">
        <h1>{heading}</h1>
        <p className="lede">{user.business?.name}</p>
        <View user={user} />
      </main>
    </>
  );
}
