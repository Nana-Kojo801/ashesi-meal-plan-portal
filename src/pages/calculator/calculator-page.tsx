import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight, Minus, Plus, Search, ShoppingCart, Trash2, X } from 'lucide-react';
import { fetchHistory } from '../../api';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';
import { fmtAmount, todayISO } from '../../lib/utils';
import type { HistoryItem } from '../../types';

interface CartItem { cafe: string; name: string; price: number; qty: number }
interface MenuItem { name: string; price: number; count: number }
interface CafeData { cafe: string; items: MenuItem[] }

function nDaysAgoISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export function CalculatorPage() {
  const { balanceData, isMobile } = useAppContext();
  const { studentId } = useSessionStore();
  const [view, setView] = useState<'cafes' | 'menu'>('menu');
  const [activeCafe, setActiveCafe] = useState<string | null>(null);
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const { data: history = [], isLoading } = useQuery<HistoryItem[]>({
    queryKey: ['history-menu', studentId],
    queryFn: () => fetchHistory(studentId!, nDaysAgoISO(180), todayISO()),
    enabled: !!studentId,
    staleTime: 10 * 60 * 1000,
  });

  const cafes = useMemo<CafeData[]>(() => {
    const map: Record<string, Record<string, { price: number; latest: string; count: number }>> = {};
    history.forEach((tx) => {
      const cafe = tx.transaction_point || 'Unknown';
      map[cafe] ??= {};
      const previous = map[cafe][tx.name];
      if (!previous || tx.date > previous.latest) {
        map[cafe][tx.name] = { price: tx.cost, latest: tx.date, count: (previous?.count ?? 0) + 1 };
      } else {
        previous.count += 1;
      }
    });
    return Object.entries(map).map(([cafe, items]) => ({
      cafe,
      items: Object.entries(items).map(([name, value]) => ({ name, price: value.price, count: value.count })).sort((a, b) => b.count - a.count),
    })).sort((a, b) => a.cafe.localeCompare(b.cafe));
  }, [history]);

  const selectedCafe = activeCafe ?? cafes[0]?.cafe ?? null;
  const activeData = cafes.find((entry) => entry.cafe === selectedCafe);
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!activeData) return [];
    return query ? activeData.items.filter((item) => item.name.toLowerCase().includes(query)) : activeData.items;
  }, [activeData, search]);

  const keyFor = (cafe: string, name: string) => `${cafe}::${name}`;
  const cartItems = Array.from(cart.values());
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const balance = balanceData?.current_balance ?? 0;
  const afterPurchase = balance - cartTotal;

  const addItem = (cafe: string, item: Pick<MenuItem, 'name' | 'price'>) => setCart((previous) => {
    const next = new Map(previous);
    const key = keyFor(cafe, item.name);
    const existing = next.get(key);
    next.set(key, existing ? { ...existing, qty: existing.qty + 1 } : { cafe, name: item.name, price: item.price, qty: 1 });
    return next;
  });
  const decreaseItem = (cafe: string, name: string) => setCart((previous) => {
    const next = new Map(previous);
    const key = keyFor(cafe, name);
    const existing = next.get(key);
    if (!existing) return previous;
    if (existing.qty <= 1) next.delete(key);
    else next.set(key, { ...existing, qty: existing.qty - 1 });
    return next;
  });
  const removeItem = (cafe: string, name: string) => setCart((previous) => {
    const next = new Map(previous);
    next.delete(keyFor(cafe, name));
    return next;
  });

  const renderOrderContents = (inSheet = false) => (
    <>
      <div className="panel-head">
        <div>
          <h2 className="order-title">Your order</h2>
          <div style={{ marginTop: 5, fontSize: 12, opacity: .75, fontWeight: 700 }}>{cartCount} item{cartCount === 1 ? '' : 's'}</div>
        </div>
        {inSheet && <button className="text-button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={19} /></button>}
        {!inSheet && cartCount > 0 && <button className="text-button" style={{ color: 'inherit', opacity: .8 }} onClick={() => setCart(new Map())}><Trash2 size={14} /> Clear all</button>}
      </div>
      <div style={{ marginTop: 18 }}>
        <AnimatePresence initial={false}>
          {cartItems.length === 0 ? (
            <div className="empty-state" style={{ color: 'inherit', opacity: .7 }}>Add items to preview your spend.</div>
          ) : cartItems.map((item) => (
            <motion.div className="order-row" key={keyFor(item.cafe, item.name)} layout initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
              <div><strong>{item.name}</strong><small>{item.cafe} · GHS {fmtAmount(item.price)}</small></div>
              <div className="quantity">
                <button className="secondary" onClick={() => decreaseItem(item.cafe, item.name)}><Minus size={13} /></button>
                <motion.strong key={item.qty} initial={{ scale: .6 }} animate={{ scale: 1 }}>{item.qty}</motion.strong>
                <button onClick={() => addItem(item.cafe, item)}><Plus size={13} /></button>
                {inSheet && <button className="secondary" onClick={() => removeItem(item.cafe, item.name)}><Trash2 size={12} /></button>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="order-summary">
        <div className="order-total"><strong>GHS {fmtAmount(balance)}</strong><span>Balance</span></div>
        <div className="order-total"><motion.strong key={cartTotal} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>GHS {fmtAmount(cartTotal)}</motion.strong><span>Total</span></div>
        <div className="order-total"><strong style={{ color: afterPurchase < 0 ? '#ffb4bf' : undefined }}>GHS {fmtAmount(afterPurchase)}</strong><span>After</span></div>
      </div>
    </>
  );

  return (
    <>
      <div className="page calculator-layout">
        <section className="calculator-main">
          <div className="calculator-header">
            <div><h1 className="calculator-title">Price Calculator</h1><p className="page-subtitle">Plan your meals and track your spending.</p></div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {view === 'cafes' ? (
              <motion.div key="cafes" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                {isLoading ? <div className="empty-state">Loading cafés…</div> : cafes.length === 0 ? <div className="empty-state">No menu history is available yet.</div> : (
                  <div className="cafe-list">
                    {cafes.map(({ cafe, items }, index) => {
                      const count = cartItems.filter((item) => item.cafe === cafe).reduce((sum, item) => sum + item.qty, 0);
                      return (
                        <motion.button
                          className="cafe-button"
                          key={cafe}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * .05 }}
                          onClick={() => { setActiveCafe(cafe); setSearch(''); setView('menu'); }}
                        >
                          <div className="panel-head">
                            <div><strong>{cafe}</strong><div className="activity-meta">{items.length} items</div></div>
                            {count ? <span className="rank-number">{count}</span> : <ChevronRight size={18} color="#667085" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }}>
                <button className="text-button" onClick={() => { setView('cafes'); setActiveCafe(null); setSearch(''); }}><ArrowLeft size={15} /> Back to cafés</button>
                <div className="cafe-banner red-plane"><ShoppingCart size={20} /> {selectedCafe}</div>
                <div className="search-box">
                  <Search size={17} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menu items…" />
                  {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: 13, background: 'transparent' }}><X size={15} /></button>}
                </div>
                <div style={{ marginTop: 18 }}>
                  {filteredItems.length === 0 ? <div className="empty-state">No items match “{search}”.</div> : filteredItems.map((item, index) => {
                    const selected = selectedCafe ? cart.get(keyFor(selectedCafe, item.name)) : undefined;
                    return (
                      <motion.div className="menu-row" key={item.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .035 }}>
                        <div className="menu-name">{item.name}<small>Ordered {item.count}×</small></div>
                        <div className="menu-price">GHS {fmtAmount(item.price)}</div>
                        <div className="quantity">
                          {selected && <><button style={{ background: '#f3f4f6', color: '#df001f' }} onClick={() => decreaseItem(selectedCafe!, item.name)}><Minus size={13} /></button><motion.strong key={selected.qty} initial={{ scale: .6 }} animate={{ scale: 1 }}>{selected.qty}</motion.strong></>}
                          <button onClick={() => addItem(selectedCafe!, item)}><Plus size={14} /></button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        <aside className="calculator-order red-plane">{renderOrderContents()}</aside>
      </div>

      <AnimatePresence>
        {cartCount > 0 && isMobile && createPortal(
          <motion.button className="cart-fab" onClick={() => setCartOpen(true)} initial={{ opacity: 0, y: 25, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .9 }}>
            <span className="cart-fab-main"><ShoppingCart size={28} /><span><small>{cartCount} item{cartCount === 1 ? '' : 's'}</small><strong>GHS {fmtAmount(cartTotal)}</strong></span><ChevronRight size={20} /></span>
            <span className="cart-fab-summary">
              <span><small>Balance</small><strong>GHS {fmtAmount(balance)}</strong></span>
              <span><small>Total</small><strong>GHS {fmtAmount(cartTotal)}</strong></span>
              <span><small>After</small><strong>GHS {fmtAmount(afterPurchase)}</strong></span>
            </span>
          </motion.button>,
          document.body,
        )}
      </AnimatePresence>

      {createPortal(
        <AnimatePresence>
          {cartOpen && (
            <>
              <motion.div className="cart-backdrop" onClick={() => setCartOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              <motion.aside className="cart-sheet" initial={{ x: isMobile ? 0 : '100%', y: isMobile ? '100%' : 0 }} animate={{ x: 0, y: 0 }} exit={{ x: isMobile ? 0 : '100%', y: isMobile ? '100%' : 0 }} transition={{ type: 'spring', stiffness: 280, damping: 30 }}>
                {renderOrderContents(true)}
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
