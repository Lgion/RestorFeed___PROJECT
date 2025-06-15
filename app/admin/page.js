"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    // Appel API pour récupérer USERPWD côté serveur
    let userpwd = "";
    try {
      const res = await fetch("/api/userpwd");
      userpwd = await res.text();
    } catch {
      setError("Erreur serveur (USERPWD)");
      return;
    }
    if (!userpwd.includes("§_§")) {
      setError("Configuration USERPWD invalide");
      return;
    }
    const [validUser, validPwd] = userpwd.split("§_§");
    if (form.username !== validUser || form.password !== validPwd) {
      setError("Identifiant ou mot de passe incorrect");
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("role", "superadmin");
    }
    router.push("/menu");
  };

  return (
    <div className="admin-page">
      <h1>Connexion Admin</h1>
      <form className="admin-page__form" onSubmit={handleSubmit}>
        <label>
          Nom d'utilisateur
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        {error && <div className="admin-page__error">{error}</div>}
        <button className="admin-page__submit" type="submit">Valider</button>
      </form>
    </div>
  );
}
