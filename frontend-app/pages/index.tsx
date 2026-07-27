import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<null | { email: string }>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser ? { email: currentUser.email ?? "" } : null);
    });
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login realizado com sucesso.");
    } catch (error: any) {
      setMessage(error.message || "Erro no login.");
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
    setMessage(JSON.stringify(data));
  };

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Unio MVP</h1>
      <p>Login com Firebase Authentication</p>

      {user ? (
        <div>
          <p>Bem-vindo, {user.email}</p>
          <button onClick={handleSignOut}>Sair</button>
          <button onClick={callBackendProfile}>Ver perfil protegido</button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, maxWidth: 320 }}>
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
          <button onClick={handleSignIn}>Entrar</button>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <p>{message}</p>
      </div>
    </main>
  );
}
