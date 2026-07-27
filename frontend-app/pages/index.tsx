import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Home() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<null | { email: string }>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser ? { email: currentUser.email ?? "" } : null);
    });

    return () => unsubscribe();
  }, []);

  const handleAuth = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("Login realizado com sucesso.");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("Conta criada com sucesso. Você já está conectado.");
      }
    } catch (error: any) {
      setMessage(error.message || "Erro no processo de autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setMessage("Desconectado.");
  };

  const callBackendProfile = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      setMessage("Faça login primeiro.");
      return;
    }

    const response = await fetch("/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    setMessage(JSON.stringify(data, null, 2));
  };

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Unio MVP</h1>
      <p>Autenticação com Firebase</p>

      {user ? (
        <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
          <p>Bem-vindo, <strong>{user.email}</strong></p>
          <button onClick={handleSignOut}>Sair</button>
          <button onClick={callBackendProfile}>Ver perfil protegido</button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, maxWidth: 320 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setMode("login")} disabled={mode === "login"}>
              Login
            </button>
            <button type="button" onClick={() => setMode("signup")} disabled={mode === "signup"}>
              Signup
            </button>
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleAuth} disabled={loading || !email || !password}>
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </div>
      )}

      <div style={{ marginTop: 24, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
        {message}
      </div>
    </main>
  );
}
