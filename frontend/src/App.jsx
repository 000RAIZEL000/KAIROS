import { useEffect, useState } from "react";
import { torneosAPI, authAPI } from "./services/api";

const styles = {
  root: { fontFamily: "'Inter', Arial, sans-serif", minHeight: "100vh", background: "#0f172a", color: "#f1f5f9" },
  header: { background: "#1e293b", borderBottom: "1px solid #334155", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: "22px", fontWeight: 700, color: "#38bdf8", letterSpacing: "-0.5px" },
  badge: { background: "#0ea5e9", color: "#fff", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", marginLeft: "8px", verticalAlign: "middle" },
  main: { maxWidth: "960px", margin: "0 auto", padding: "40px 24px" },
  h2: { fontSize: "20px", fontWeight: 600, marginBottom: "24px", color: "#94a3b8" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
  card: { background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px", cursor: "pointer", transition: "border-color 0.15s" },
  cardTitle: { fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: "#f1f5f9" },
  cardMeta: { fontSize: "13px", color: "#64748b", marginBottom: "4px" },
  pill: { display: "inline-block", padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 },
  empty: { textAlign: "center", padding: "80px 0", color: "#475569" },
  error: { background: "#450a0a", border: "1px solid #7f1d1d", color: "#fca5a5", padding: "16px", borderRadius: "8px", marginBottom: "24px" },
  login: { maxWidth: "360px", margin: "80px auto", background: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "32px" },
  input: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9", fontSize: "14px", boxSizing: "border-box", marginBottom: "12px" },
  btn: { width: "100%", padding: "11px", borderRadius: "8px", border: "none", background: "#0ea5e9", color: "#fff", fontWeight: 600, fontSize: "15px", cursor: "pointer" },
  btnSm: { padding: "6px 14px", borderRadius: "6px", border: "none", background: "#1e40af", color: "#fff", fontSize: "13px", cursor: "pointer" },
};

function estadoPill(estado) {
  const map = {
    Activo: { background: "#14532d", color: "#86efac" },
    Finalizado: { background: "#1e3a5f", color: "#93c5fd" },
    Pendiente: { background: "#713f12", color: "#fde68a" },
  };
  const s = map[estado] ?? { background: "#1e293b", color: "#94a3b8" };
  return <span style={{ ...styles.pill, ...s }}>{estado}</span>;
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authAPI.login(email, password);
      onLogin();
    } catch {
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.login}>
      <h2 style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: 700 }}>Iniciar sesión</h2>
      {error && <p style={{ color: "#fca5a5", marginBottom: "12px", fontSize: "14px" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={styles.input} type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
        <button style={styles.btn} type="submit" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</button>
      </form>
    </div>
  );
}

export default function App() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authed, setAuthed] = useState(!!localStorage.getItem("access_token"));

  useEffect(() => {
    if (!authed) { setLoading(false); return; }
    torneosAPI.list()
      .then(res => setTorneos(res.data))
      .catch(err => {
        if (err.response?.status === 401) setAuthed(false);
        else setError(err.message ?? "Error al cargar torneos");
      })
      .finally(() => setLoading(false));
  }, [authed]);

  if (!authed) return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.logo}>Kairos <span style={styles.badge}>AG</span></span>
      </header>
      <LoginForm onLogin={() => setAuthed(true)} />
    </div>
  );

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.logo}>Kairos <span style={styles.badge}>AG</span></span>
        <button style={styles.btnSm} onClick={() => { authAPI.logout(); setAuthed(false); }}>Cerrar sesión</button>
      </header>
      <main style={styles.main}>
        <h2 style={styles.h2}>Torneos</h2>
        {error && <div style={styles.error}>{error}</div>}
        {loading && <p style={{ color: "#475569" }}>Cargando...</p>}
        {!loading && !error && torneos.length === 0 && (
          <div style={styles.empty}>
            <p style={{ fontSize: "48px", margin: 0 }}>⚽</p>
            <p>No hay torneos disponibles.</p>
          </div>
        )}
        <div style={styles.grid}>
          {torneos.map(t => (
            <div key={t.id} style={styles.card}>
              <div style={styles.cardTitle}>{t.nombre}</div>
              <div style={styles.cardMeta}>{t.deporte ?? "Fútbol"} · {t.categoria ?? "General"}</div>
              <div style={styles.cardMeta}>{t.ciudad ?? ""}{t.pais ? `, ${t.pais}` : ""}</div>
              <div style={{ marginTop: "12px" }}>{estadoPill(t.estado)}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
