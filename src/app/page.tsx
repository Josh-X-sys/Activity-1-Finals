"use client";
import { useEffect, useState } from "react";
import { databases, account, teams, ID } from "./lib/appwrite";
import { Query, Permission, Role } from "appwrite";

export default function Page() {
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!;

  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [inStock, setInStock] = useState(true);

  // For editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStock, setEditStock] = useState(true);

  //Permission Roles
  const EDITORS_TEAM_ID = process.env.NEXT_PUBLIC_EDITORS_TEAM_ID!;
  const VIEWERS_TEAM_ID = process.env.NEXT_PUBLIC_VIEWERS_TEAM_ID!;

  // Check if user is an editor
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadProducts();
      checkEditorStatus();
    }
  }, [user]);

  async function checkEditorStatus() {
    try {
      const userTeams = await teams.list();
      const isInEditors = userTeams.teams.some((team: any) => team.$id === EDITORS_TEAM_ID);
      setIsEditor(isInEditors);
    } catch (e: any) {
      console.error("Error checking editor status:", e);
      setIsEditor(false);
    }
  }

  async function refreshUser() {
    try {
      const me = await account.get();
      setUser(me);
    } catch {
      setUser(null);
    }
  }

  async function login() {
    try {
      await account.createEmailPasswordSession(email, password);
      await refreshUser();
      setError("");
    } catch (e: any) {
      setError(e.message ?? "Login failed");
    }
  }

  async function loginwithAuth0() {
    try {
      await account.createOAuth2Session({
        provider: "auth0",
        success: `${process.env.NEXT_PUBLIC_APP_URL}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}`,
        scopes: ["openid", "profile", "email"]
      });
    } catch (e: any) {
      setError(e.message ?? "Auth0 Login Failed");
    }
  }

  async function register() {
    try {
      await account.create(ID.unique(), email, password);
      await account.createEmailPasswordSession(email, password);
      await refreshUser();
      setError("");
    } catch (e: any) {
      setError(e.message ?? "Registration failed");
    }
  }

  async function logout() {
    await account.deleteSession("current");
    setUser(null);
    setIsEditor(false);
  }

  async function loadProducts() {
    try {
      const res = await databases.listDocuments(databaseId, collectionId, [
        Query.orderDesc("$createdAt"),
      ]);
      setProducts(res.documents);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function addProduct() {
    if (!isEditor) {
      setError("You don't have permission to add products. Only Editors can perform this action.");
      return;
    }

    try {
      await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        {
          name,
          price: parseFloat(price),
          description,
          category,
          inStock,
        },
        [
          Permission.read(Role.team(EDITORS_TEAM_ID)),
          Permission.read(Role.team(VIEWERS_TEAM_ID)),
          Permission.update(Role.team(EDITORS_TEAM_ID)),
          Permission.delete(Role.team(EDITORS_TEAM_ID)),
        ]
      );

      setName("");
      setPrice("");
      setDescription("");
      setCategory("");
      setInStock(true);
      setError("");
      await loadProducts();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function deleteProduct(id: string) {
    if (!isEditor) {
      setError("You don't have permission to delete products. Only Editors can perform this action.");
      return;
    }

    try {
      await databases.deleteDocument(databaseId, collectionId, id);
      setError("");
      await loadProducts();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function saveEdit(id: string) {
    if (!isEditor) {
      setError("You don't have permission to update products. Only Editors can perform this action.");
      return;
    }

    try {
      await databases.updateDocument(databaseId, collectionId, id, {
        name: editName,
        price: parseFloat(editPrice),
        category: editCategory,
        description: editDescription,
        inStock: editStock,
      });
      setEditingId(null);
      setError("");
      await loadProducts();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function startEditing(p: any) {
    if (!isEditor) {
      setError("You don't have permission to edit products. Only Editors can perform this action.");
      return;
    }
    setEditingId(p.$id);
    setEditName(p.name);
    setEditPrice(p.price);
    setEditCategory(p.category);
    setEditDescription(p.description);
    setEditStock(p.inStock);
  }

  if (!user) {
    return (
      <main className="container mt-5" style={{ maxWidth: 420 }}>
        <h2 className="mb-3 text-center">Login or Register</h2>
        <input
          className="form-control mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="form-control mb-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="d-flex justify-content-between">
          <button className="btn btn-primary" onClick={login}>
            Login
          </button>
          <button className="btn btn-dark" onClick={loginwithAuth0}>
            Login with Auth0
          </button>
        </div>
        <p>
          Email : test@gmail.com <br />
          Password : password
        </p>
        {error && <p className="text-danger mt-3">{error}</p>}
      </main>
    );
  }

  return (
    <main className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3>Welcome, {user.name || user.email}</h3>
          <span className={`badge ${isEditor ? 'bg-success' : 'bg-secondary'}`}>
            {isEditor ? 'Editor' : 'Viewer'}
          </span>
        </div>
        <button className="btn btn-outline-danger" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Add Product - Only visible for editors */}
      {isEditor && (
        <div className="card p-3 mb-4">
          <h5>Add Product</h5>
          <div className="row g-2">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <input
                className="form-control"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="col-md-1 d-flex align-items-center">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="form-check-input"
              />
            </div>
          </div>
          <button className="btn btn-success mt-3" onClick={addProduct}>
            Add
          </button>
        </div>
      )}

      {/* Product List */}
      <div className="row">
        {products.map((p) => (
          <div key={p.$id} className="col-md-4 mb-3">
            <div className="card p-3 shadow-sm">
              {editingId === p.$id && isEditor ? (
                <div className="p-2">
                  <div className="mb-2">
                    <input
                      className="form-control"
                      placeholder="Name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      className="form-control"
                      placeholder="Price"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      className="form-control"
                      placeholder="Category"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <textarea
                      className="form-control"
                      placeholder="Description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={editStock}
                      onChange={(e) => setEditStock(e.target.checked)}
                      id={`stock-${p.$id}`}
                    />
                    <label htmlFor={`stock-${p.$id}`} className="form-check-label">
                      In Stock
                    </label>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success flex-fill"
                      onClick={() => saveEdit(p.$id)}
                    >
                      Save Changes
                    </button>
                    <button
                      className="btn btn-secondary flex-fill"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h5>{p.name}</h5>
                  <p className="mb-1">{p.description}</p>
                  <p className="text-muted mb-1">
                    {p.category} — ${p.price}
                  </p>
                  <p className={p.inStock ? "text-success" : "text-danger"}>
                    {p.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                  {isEditor && (
                    <div className="d-flex gap-2 mt-2">
                      <button
                        className="btn btn-sm btn-primary flex-fill"
                        onClick={() => startEditing(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger flex-fill"
                        onClick={() => deleteProduct(p.$id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-danger mt-3">{error}</p>}
    </main>
  );
}