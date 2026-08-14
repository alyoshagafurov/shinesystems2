"use client";

import { useState, useEffect, useCallback } from "react";

interface Category { id: string; name: string; slug: string; parentId: string | null; order: number }
interface Product { id: string; name: string; description: string; composition: string; dilution: string; application: string; precautions: string; storage: string; shelfLife: string; price: number; images: string[]; inStock: boolean; categoryId: string; category?: Category }
interface OrderItem { id: string; name: string; price: number; quantity: number; productId: string }
interface Order { id: string; firstName: string; lastName: string; phone: string; address: string; comment: string; total: number; status: string; items: OrderItem[]; createdAt: string }

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"products" | "orders" | "categories">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatParentId, setNewCatParentId] = useState<string>("");
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState("");

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    if (res.ok) { setAuthed(true); loadData(); }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const handleLogin = async () => {
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    if (res.ok) { setAuthed(true); loadData(); }
    else setError("Неверный логин или пароль");
  };

  const loadData = async () => {
    const [p, o, c] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]);
    setProducts(p); setOrders(o); setCategories(c);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
  };

  const saveProduct = async () => {
    if (!editProduct?.name || !editProduct?.categoryId) return;
    const url = editProduct.id ? `/api/admin/products/${editProduct.id}` : "/api/admin/products";
    const method = editProduct.id ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editProduct),
    });
    setEditProduct(null);
    loadData();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Удалить товар?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadData();
  };

  const saveOrder = async () => {
    if (!editOrder) return;
    await fetch(`/api/admin/orders/${editOrder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editOrder),
    });
    setEditOrder(null);
    loadData();
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Удалить заказ?")) return;
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    loadData();
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName.trim(), parentId: newCatParentId || null }),
    });
    if (res.ok) {
      setNewCatName("");
      setNewCatParentId("");
      loadData();
    }
  };

  const saveCategory = async () => {
    if (!editCat || !editCatName.trim()) return;
    await fetch(`/api/admin/categories/${editCat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editCatName.trim() }),
    });
    setEditCat(null);
    setEditCatName("");
    loadData();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Удалить категорию?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Ошибка удаления");
    }
    loadData();
  };

  const topCategories = categories.filter((c) => !c.parentId);
  const getChildren = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  const leafCategories = categories.filter((c) => !categories.some((ch) => ch.parentId === c.id));

  const getCategoryPath = (cat: Category): string => {
    const parts: string[] = [cat.name];
    let current = cat;
    while (current.parentId) {
      const parent = categories.find((c) => c.id === current.parentId);
      if (!parent) break;
      parts.unshift(parent.name);
      current = parent;
    }
    return parts.join(" → ");
  };

  if (!authed) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
          <h1 className="text-xl font-bold text-center mb-6">Админ-панель</h1>
          {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
          <input type="text" placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-neutral-50 text-sm mb-3 border-0" />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full px-4 py-3 rounded-xl bg-neutral-50 text-sm mb-4 border-0" />
          <button onClick={handleLogin} className="w-full py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium">Войти</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-sm font-bold">AUTOSHINE.TJ</span>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 -mr-2" aria-label="Меню">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-neutral-100 bg-white px-4 py-3 space-y-1">
            <button onClick={() => { setTab("products"); setMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${tab === "products" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"}`}>
              Товары ({products.length})
            </button>
            <button onClick={() => { setTab("categories"); setMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${tab === "categories" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"}`}>
              Категории ({categories.length})
            </button>
            <button onClick={() => { setTab("orders"); setMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${tab === "orders" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"}`}>
              Заказы ({orders.length})
            </button>
            <a href="/" className="block w-full text-left px-4 py-2.5 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50">На сайт</a>
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50">Выйти</button>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {tab === "products" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Товары</h2>
              <button
                onClick={() => setEditProduct({ name: "", description: "", composition: "", dilution: "", application: "", precautions: "", storage: "", shelfLife: "", price: 0, images: [], inStock: true, categoryId: leafCategories[0]?.id || "" })}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium"
              >
                + Добавить товар
              </button>
            </div>

            {editProduct && (
              <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-4 space-y-3">
                <h3 className="text-sm font-bold">{editProduct.id ? "Редактировать" : "Новый товар"}</h3>
                <input placeholder="Название" value={editProduct.name || ""} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0" />
                <textarea placeholder="Описание" value={editProduct.description || ""} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0 resize-none" rows={2} />
                <input placeholder="Состав" value={editProduct.composition || ""} onChange={(e) => setEditProduct({ ...editProduct, composition: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0" />
                <input placeholder="Разбавление" value={editProduct.dilution || ""} onChange={(e) => setEditProduct({ ...editProduct, dilution: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0" />
                <textarea placeholder="Применение" value={editProduct.application || ""} onChange={(e) => setEditProduct({ ...editProduct, application: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0 resize-none" rows={2} />
                <textarea placeholder="Меры предосторожности" value={editProduct.precautions || ""} onChange={(e) => setEditProduct({ ...editProduct, precautions: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0 resize-none" rows={2} />
                <input placeholder="Условия хранения" value={editProduct.storage || ""} onChange={(e) => setEditProduct({ ...editProduct, storage: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0" />
                <input placeholder="Срок годности" value={editProduct.shelfLife || ""} onChange={(e) => setEditProduct({ ...editProduct, shelfLife: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Цена" value={editProduct.price || ""} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} className="px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0" />
                  <select value={editProduct.categoryId || ""} onChange={(e) => setEditProduct({ ...editProduct, categoryId: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0">
                    {leafCategories.map((c) => (
                      <option key={c.id} value={c.id}>{getCategoryPath(c)}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editProduct.inStock ?? true} onChange={(e) => setEditProduct({ ...editProduct, inStock: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-sm">В наличии</span>
                </label>
                <div className="space-y-2">
                  {(editProduct.images?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editProduct.images!.map((url, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-50 group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { const imgs = editProduct.images!.filter((_, j) => j !== i); setEditProduct({ ...editProduct, images: imgs }); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-neutral-200 cursor-pointer hover:border-neutral-400 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-xs text-neutral-500">{uploading ? "Загрузка..." : "Добавить фото (до 5 МБ)"}</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      setUploading(true);
                      const currentImages = editProduct.images || [];
                      const newImages = [...currentImages];
                      for (let k = 0; k < files.length; k++) {
                        const fd = new FormData();
                        fd.append("file", files[k]);
                        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (data.url) newImages.push(data.url);
                        else alert(data.error || "Ошибка загрузки");
                      }
                      setUploading(false);
                      setEditProduct({ ...editProduct, images: newImages });
                      e.target.value = "";
                    }} />
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveProduct} className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium">Сохранить</button>
                  <button onClick={() => setEditProduct(null)} className="px-4 py-2 rounded-xl bg-neutral-100 text-xs font-medium">Отмена</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-neutral-100 p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-neutral-50 shrink-0 overflow-hidden">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-neutral-400">{p.category?.name} · {p.price.toLocaleString("ru-RU")} с. · <span className={p.inStock ? "text-green-600" : "text-red-500"}>{p.inStock ? "В наличии" : "Нет"}</span></p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setEditProduct(p)} className="px-3 py-1.5 rounded-lg bg-neutral-100 text-xs font-medium">Изм.</button>
                    <button onClick={() => deleteProduct(p.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium">Уд.</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "categories" && (
          <>
            <h2 className="text-lg font-bold mb-4">Категории</h2>

            <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-4 space-y-3">
              <h3 className="text-sm font-bold">Добавить категорию</h3>
              <input placeholder="Название категории" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0" />
              <select value={newCatParentId} onChange={(e) => setNewCatParentId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0">
                <option value="">Верхний уровень (без родителя)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{getCategoryPath(c)}</option>
                ))}
              </select>
              <button onClick={addCategory} className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium">+ Добавить</button>
            </div>

            {editCat && (
              <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-4 space-y-3">
                <h3 className="text-sm font-bold">Редактировать: {editCat.name}</h3>
                <input placeholder="Новое название" value={editCatName} onChange={(e) => setEditCatName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0" />
                <div className="flex gap-2">
                  <button onClick={saveCategory} className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium">Сохранить</button>
                  <button onClick={() => { setEditCat(null); setEditCatName(""); }} className="px-4 py-2 rounded-xl bg-neutral-100 text-xs font-medium">Отмена</button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {topCategories.map((top) => {
                const mid = getChildren(top.id);
                return (
                  <div key={top.id} className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm font-bold">{top.name}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => { setEditCat(top); setEditCatName(top.name); }} className="px-2 py-1 rounded-lg bg-neutral-100 text-[10px] font-medium">Изм.</button>
                        <button onClick={() => deleteCategory(top.id)} className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-[10px] font-medium">Уд.</button>
                      </div>
                    </div>
                    {mid.length > 0 && (
                      <div className="border-t border-neutral-50">
                        {mid.map((m) => {
                          const leaves = getChildren(m.id);
                          return (
                            <div key={m.id}>
                              <div className="flex items-center justify-between px-4 py-2.5 pl-8 bg-neutral-50/50">
                                <span className="text-xs font-medium text-neutral-700">{m.name}</span>
                                <div className="flex gap-1.5">
                                  <button onClick={() => { setEditCat(m); setEditCatName(m.name); }} className="px-2 py-1 rounded-lg bg-neutral-100 text-[10px] font-medium">Изм.</button>
                                  <button onClick={() => deleteCategory(m.id)} className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-[10px] font-medium">Уд.</button>
                                </div>
                              </div>
                              {leaves.length > 0 && (
                                <div>
                                  {leaves.map((l) => (
                                    <div key={l.id} className="flex items-center justify-between px-4 py-2 pl-14 border-t border-neutral-50">
                                      <span className="text-xs text-neutral-500">{l.name}</span>
                                      <div className="flex gap-1.5">
                                        <button onClick={() => { setEditCat(l); setEditCatName(l.name); }} className="px-2 py-1 rounded-lg bg-neutral-100 text-[10px] font-medium">Изм.</button>
                                        <button onClick={() => deleteCategory(l.id)} className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-[10px] font-medium">Уд.</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "orders" && (
          <>
            <h2 className="text-lg font-bold mb-4">Заказы</h2>

            {editOrder && (
              <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-4 space-y-3">
                <h3 className="text-sm font-bold">Редактировать заказ</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Имя" value={editOrder.firstName} onChange={(e) => setEditOrder({ ...editOrder, firstName: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0" />
                  <input placeholder="Фамилия" value={editOrder.lastName} onChange={(e) => setEditOrder({ ...editOrder, lastName: e.target.value })} className="px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0" />
                </div>
                <input placeholder="Телефон" value={editOrder.phone} onChange={(e) => setEditOrder({ ...editOrder, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0" />
                <input placeholder="Адрес" value={editOrder.address} onChange={(e) => setEditOrder({ ...editOrder, address: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0" />
                <textarea placeholder="Комментарий" value={editOrder.comment} onChange={(e) => setEditOrder({ ...editOrder, comment: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0 resize-none" rows={2} />
                <select value={editOrder.status} onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-0">
                  <option value="new">Новый</option>
                  <option value="processing">В обработке</option>
                  <option value="delivered">Доставлен</option>
                  <option value="cancelled">Отменен</option>
                </select>

                <div className="space-y-2 pt-2">
                  <div className="flex gap-2 items-center text-[10px] font-bold text-neutral-400 uppercase">
                    <span className="flex-1">Товары:</span>
                    <span className="w-16 text-center">Кол-во</span>
                    <span className="w-24 text-center">Цена</span>
                    <span className="w-4"></span>
                  </div>
                  {editOrder.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={item.name} onChange={(e) => { const items = [...editOrder.items]; items[i] = { ...items[i], name: e.target.value }; setEditOrder({ ...editOrder, items }); }} className="flex-1 px-3 py-2 rounded-lg bg-neutral-50 text-xs border-0" />
                      <input type="number" value={item.quantity} onChange={(e) => { const items = [...editOrder.items]; items[i] = { ...items[i], quantity: Number(e.target.value) }; setEditOrder({ ...editOrder, items }); }} className="w-16 px-3 py-2 rounded-lg bg-neutral-50 text-xs border-0" />
                      <input type="number" value={item.price} onChange={(e) => { const items = [...editOrder.items]; items[i] = { ...items[i], price: Number(e.target.value) }; setEditOrder({ ...editOrder, items }); }} className="w-24 px-3 py-2 rounded-lg bg-neutral-50 text-xs border-0" />
                      <button onClick={() => { const items = editOrder.items.filter((_, j) => j !== i); setEditOrder({ ...editOrder, items }); }} className="text-red-400 text-xs">✕</button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={saveOrder} className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium">Сохранить</button>
                  <button onClick={() => setEditOrder(null)} className="px-4 py-2 rounded-xl bg-neutral-100 text-xs font-medium">Отмена</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-neutral-100 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium">{order.firstName} {order.lastName}</p>
                      <p className="text-xs text-neutral-400">{order.phone} · {new Date(order.createdAt).toLocaleDateString("ru-RU")}</p>
                      {order.address && <p className="text-xs text-neutral-400">{order.address}</p>}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                      order.status === "new" ? "bg-blue-50 text-blue-600" :
                      order.status === "processing" ? "bg-amber-50 text-amber-600" :
                      order.status === "delivered" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                    }`}>
                      {order.status === "new" ? "Новый" : order.status === "processing" ? "В обработке" : order.status === "delivered" ? "Доставлен" : "Отменен"}
                    </span>
                  </div>

                  <div className="mb-3 overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="py-2 pr-2 text-left text-neutral-400 font-medium w-8">№</th>
                          <th className="py-2 px-2 text-left text-neutral-400 font-medium">Наименование товара</th>
                          <th className="py-2 px-2 text-center text-neutral-400 font-medium w-16">Кол-во</th>
                          <th className="py-2 px-2 text-right text-neutral-400 font-medium w-20">Цена, сомони</th>
                          <th className="py-2 pl-2 text-right text-neutral-400 font-medium w-20">Сумма, сомони</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, idx) => (
                          <tr key={item.id} className="border-b border-neutral-50">
                            <td className="py-2 pr-2 font-medium">{idx + 1}</td>
                            <td className="py-2 px-2">{item.name}</td>
                            <td className="py-2 px-2 text-center">{item.quantity} шт</td>
                            <td className="py-2 px-2 text-right">{item.price.toLocaleString("ru-RU")}</td>
                            <td className="py-2 pl-2 text-right font-medium">{(item.price * item.quantity).toLocaleString("ru-RU")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
                    <span className="text-sm font-bold">{order.total.toLocaleString("ru-RU")} с.</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditOrder(order)} className="px-3 py-1.5 rounded-lg bg-neutral-100 text-xs font-medium">Изм.</button>
                      <button onClick={() => deleteOrder(order.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium">Уд.</button>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center text-sm text-neutral-400 py-12">Заказов пока нет</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
