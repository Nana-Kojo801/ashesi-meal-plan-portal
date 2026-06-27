import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronDown, ArrowLeft, Search, ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';
import { fetchHistory } from '../../api';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';
import { fmtAmount, todayISO } from '../../lib/utils';
import type { HistoryItem } from '../../types';

const RED    = '#D81E2C';
const BROWN  = '#7A6A63';
const INK    = '#1C1413';
const BORDER = '#ECE0D4';

function nDaysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

interface CartItem { cafe: string; name: string; price: number; qty: number }
interface MenuItem { name: string; price: number; count: number }
interface CafeData  { cafe: string; items: MenuItem[] }

function Shimmer({ w, h, r = 10 }: { w?: string | number; h: number; r?: number }) {
  return (
    <div style={{
      width: w ?? '100%', height: h, borderRadius: r, flexShrink: 0,
      background: 'linear-gradient(90deg,#F0E7DF 25%,#E5D5C8 50%,#F0E7DF 75%)',
      backgroundSize: '200% 100%',
      animation: 'sk-shimmer 1.4s infinite',
    }} />
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'red' | 'green' }) {
  const color = accent === 'red' ? RED : accent === 'green' ? '#16a34a' : INK;
  return (
    <div style={{ flex: 1, background: '#FAFAF8', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '11px 12px' }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: BROWN, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 16, color, letterSpacing: '-.3px', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, fontWeight: 700, color, marginTop: 4, opacity: .85 }}>{sub}</div>}
    </div>
  );
}

export function CalculatorPage() {
  const { balanceData, isMobile } = useAppContext();
  const { studentId } = useSessionStore();

  const [view,           setView]           = useState<'cafes' | 'menu'>('cafes');
  const [activeCafe,     setActiveCafe]     = useState<string | null>(null);
  const [cart,           setCart]           = useState<Map<string, CartItem>>(new Map());
  const [search,         setSearch]         = useState('');
  const [cartOpen,       setCartOpen]       = useState(false);
  const [collapsedCafes, setCollapsedCafes] = useState<Set<string>>(new Set());

  const { data: history = [], isLoading } = useQuery<HistoryItem[]>({
    queryKey: ['history-menu', studentId],
    queryFn:  () => fetchHistory(studentId!, nDaysAgoISO(180), todayISO()),
    enabled:  !!studentId,
    staleTime: 10 * 60 * 1000,
  });

  const cafeList = useMemo<CafeData[]>(() => {
    const map: Record<string, Record<string, { price: number; latestDate: string; count: number }>> = {};
    history.forEach(tx => {
      const cafe = tx.transaction_point || 'Unknown';
      if (!map[cafe]) map[cafe] = {};
      const prev = map[cafe][tx.name];
      if (!prev || tx.date > prev.latestDate) {
        map[cafe][tx.name] = { price: tx.cost, latestDate: tx.date, count: (prev?.count ?? 0) + 1 };
      } else {
        map[cafe][tx.name].count++;
      }
    });
    return Object.entries(map)
      .map(([cafe, items]) => ({
        cafe,
        items: Object.entries(items)
          .map(([name, { price, count }]) => ({ name, price, count }))
          .sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => a.cafe.localeCompare(b.cafe));
  }, [history]);

  const activeData    = cafeList.find(c => c.cafe === activeCafe);
  const filteredItems = useMemo(() => {
    if (!activeData) return [];
    const q = search.toLowerCase().trim();
    return q ? activeData.items.filter(i => i.name.toLowerCase().includes(q)) : activeData.items;
  }, [activeData, search]);

  const cartItems   = Array.from(cart.values());
  const cartTotal   = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount   = cartItems.reduce((s, i) => s + i.qty, 0);
  const balance     = balanceData?.current_balance ?? 0;
  const afterPurch  = balance - cartTotal;
  const canAfford   = afterPurch >= 0;
  const cartGroups  = [...new Set(cartItems.map(i => i.cafe))].sort().map(cafe => ({
    cafe,
    items: cartItems.filter(i => i.cafe === cafe),
  }));

  const ck = (cafe: string, name: string) => `${cafe}::${name}`;

  const addItem = (cafe: string, item: { name: string; price: number }) =>
    setCart(prev => {
      const next = new Map(prev), k = ck(cafe, item.name), ex = next.get(k);
      next.set(k, ex ? { ...ex, qty: ex.qty + 1 } : { cafe, name: item.name, price: item.price, qty: 1 });
      return next;
    });

  const decItem = (cafe: string, name: string) =>
    setCart(prev => {
      const next = new Map(prev), k = ck(cafe, name), ex = next.get(k);
      if (!ex) return prev;
      ex.qty <= 1 ? next.delete(k) : next.set(k, { ...ex, qty: ex.qty - 1 });
      return next;
    });

  const removeItem = (cafe: string, name: string) =>
    setCart(prev => { const next = new Map(prev); next.delete(ck(cafe, name)); return next; });

  const cafeCartCount = (cafe: string) =>
    cartItems.filter(i => i.cafe === cafe).reduce((s, i) => s + i.qty, 0);

  const toggleAccordion = (cafe: string) =>
    setCollapsedCafes(prev => {
      const next = new Set(prev);
      next.has(cafe) ? next.delete(cafe) : next.add(cafe);
      return next;
    });

  const fabBottom = isMobile ? 'calc(96px + env(safe-area-inset-bottom))' : '32px';

  const sheet = (
    <>
      {/* Backdrop — mobile only */}
      {isMobile && (
        <div
          onClick={() => setCartOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 49,
            background: 'rgba(0,0,0,.45)',
            opacity: cartOpen ? 1 : 0,
            pointerEvents: cartOpen ? 'all' : 'none',
            transition: 'opacity .28s ease',
          }}
        />
      )}

      {/* Sheet */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: isMobile ? '100vw' : 460,
        zIndex: 50,
        background: '#fff',
        boxShadow: '-8px 0 48px -8px rgba(0,0,0,.18)',
        transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Sheet header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: INK, letterSpacing: '-.4px' }}>Your Order</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: BROWN, marginTop: 2 }}>{cartCount} item{cartCount !== 1 ? 's' : ''}</div>
          </div>
          <button onClick={() => setCartOpen(false)}
            style={{ width: 34, height: 34, borderRadius: 10, background: '#F5EDE5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={15} color={INK} />
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 8, padding: '16px 16px 0', flexShrink: 0 }}>
          <StatCard label="Balance" value={`GHS ${fmtAmount(balance)}`} />
          <StatCard label="Total" value={`GHS ${fmtAmount(cartTotal)}`} sub={`${cartCount} item${cartCount !== 1 ? 's' : ''}`} accent="red" />
          <StatCard
            label="After"
            value={`GHS ${fmtAmount(afterPurch)}`}
            sub={canAfford ? 'Enough' : 'Insufficient'}
            accent={canAfford ? 'green' : 'red'}
          />
        </div>

        {/* Items header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 0', flexShrink: 0 }}>
          <span style={{ fontWeight: 800, fontSize: 13, color: INK }}>Items</span>
          <button onClick={() => { setCart(new Map()); setCartOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: RED }}>
            Clear all
          </button>
        </div>

        {/* Scrollable item list — grouped by café */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 32px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: BROWN }}>
              <ShoppingCart size={32} style={{ opacity: .3, marginBottom: 10 }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>Cart is empty</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cartGroups.map(({ cafe, items }) => {
                const collapsed  = collapsedCafes.has(cafe);
                const groupTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
                const groupCount = items.reduce((s, i) => s + i.qty, 0);
                return (
                  <div key={cafe}>
                    {/* Accordion header */}
                    <button onClick={() => toggleAccordion(cafe)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: collapsed ? '14px' : '14px 14px 0 0', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'border-radius .25s ease' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 99, background: RED, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontWeight: 800, fontSize: 14, color: INK, letterSpacing: '-.2px' }}>{cafe}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: BROWN, flexShrink: 0 }}>
                        {groupCount} item{groupCount !== 1 ? 's' : ''} · GHS {fmtAmount(groupTotal)}
                      </span>
                      <ChevronDown size={15} color={BROWN} style={{ flexShrink: 0, transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform .2s' }} />
                    </button>

                    {/* Animated expand/collapse */}
                    <div style={{ display: 'grid', gridTemplateRows: collapsed ? '0fr' : '1fr', transition: 'grid-template-rows .25s ease' }}>
                      <div style={{ minHeight: 0, overflow: 'hidden' }}>
                        <div style={{ border: `1px solid ${BORDER}`, borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
                          {items.map((ci, idx) => (
                            <div key={ck(ci.cafe, ci.name)} style={{ padding: '10px 14px', background: idx % 2 === 0 ? '#fff' : '#FAFAF8', borderBottom: idx < items.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                              {isMobile ? (
                                // Mobile: two-row layout
                                <>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 7 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: INK, flex: 1, minWidth: 0, paddingRight: 8, lineHeight: 1.3 }}>{ci.name}</div>
                                    <span style={{ fontWeight: 800, fontSize: 13, color: INK, flexShrink: 0 }}>GHS {fmtAmount(ci.price * ci.qty)}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 11, color: BROWN, fontWeight: 600 }}>GHS {fmtAmount(ci.price)} each</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                      <button onClick={() => decItem(ci.cafe, ci.name)}
                                        style={{ width: 30, height: 30, borderRadius: 9, background: '#FBF0F0', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Minus size={11} color={RED} />
                                      </button>
                                      <span style={{ fontWeight: 800, fontSize: 14, color: INK, minWidth: 18, textAlign: 'center' }}>{ci.qty}</span>
                                      <button onClick={() => addItem(ci.cafe, ci)}
                                        style={{ width: 30, height: 30, borderRadius: 9, background: RED, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Plus size={11} color="#fff" />
                                      </button>
                                      <div style={{ width: 1, height: 20, background: BORDER, margin: '0 2px' }} />
                                      <button onClick={() => removeItem(ci.cafe, ci.name)}
                                        style={{ width: 30, height: 30, borderRadius: 9, background: 'transparent', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Trash2 size={13} color={BROWN} />
                                      </button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                // Desktop: single-row layout
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ci.name}</div>
                                    <div style={{ fontSize: 11, color: BROWN, fontWeight: 600, marginTop: 2 }}>GHS {fmtAmount(ci.price)} each</div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                                    <button onClick={() => decItem(ci.cafe, ci.name)}
                                      style={{ width: 26, height: 26, borderRadius: 8, background: '#FBF0F0', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                      <Minus size={10} color={RED} />
                                    </button>
                                    <span style={{ fontWeight: 800, fontSize: 13, color: INK, minWidth: 16, textAlign: 'center' }}>{ci.qty}</span>
                                    <button onClick={() => addItem(ci.cafe, ci)}
                                      style={{ width: 26, height: 26, borderRadius: 8, background: RED, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                      <Plus size={10} color="#fff" />
                                    </button>
                                    <button onClick={() => removeItem(ci.cafe, ci.name)}
                                      style={{ width: 26, height: 26, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                      <Trash2 size={12} color={BROWN} />
                                    </button>
                                  </div>
                                  <span style={{ fontWeight: 800, fontSize: 13, color: INK, minWidth: 56, textAlign: 'right' }}>
                                    GHS {fmtAmount(ci.price * ci.qty)}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`@keyframes sk-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {view === 'cafes' ? (
          // ─── CAFE LIST ───────────────────────────────────────────────
          <>
            <div>
              <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.05 }}>Price Calculator</h1>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: BROWN, marginTop: 4 }}>Choose a café to browse its menu.</div>
            </div>

            <div style={{ background: '#FEF9EC', border: '1px solid #F5D97A', borderRadius: 14, padding: '11px 14px', fontSize: 12, color: '#7A5C1E', fontWeight: 600, lineHeight: 1.6 }}>
              ⚠️ Prices are based on your past orders and may not reflect the current official menu prices.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isLoading
                ? [0, 1, 2, 3].map(i => (
                    <div key={i} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 18, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <Shimmer w={44} h={44} r={13} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Shimmer w="55%" h={14} />
                        <Shimmer w="30%" h={11} />
                      </div>
                      <Shimmer w={18} h={18} r={6} />
                    </div>
                  ))
                : cafeList.length === 0
                  ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: BROWN }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>🍽️</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: INK }}>No café data yet</div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>Make some purchases first to build a menu.</div>
                    </div>
                  )
                  : cafeList.map(({ cafe, items }) => {
                      const n = cafeCartCount(cafe);
                      return (
                        <button key={cafe}
                          onClick={() => { setActiveCafe(cafe); setSearch(''); setView('menu'); }}
                          style={{ background: '#fff', border: `1.5px solid ${n > 0 ? RED : BORDER}`, borderRadius: 18, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%', boxShadow: n > 0 ? '0 4px 16px -6px rgba(216,30,44,.25)' : '0 2px 8px rgba(0,0,0,.04)', transition: 'all .15s' }}>
                          <div style={{ width: 44, height: 44, borderRadius: 13, background: n > 0 ? RED : '#F5EDE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s' }}>
                            {n > 0
                              ? <span style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>{n}</span>
                              : <span style={{ fontSize: 20 }}>🍴</span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: 15, color: INK, letterSpacing: '-.2px' }}>{cafe}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: BROWN, marginTop: 2 }}>{items.length} item{items.length !== 1 ? 's' : ''}</div>
                          </div>
                          <ChevronRight size={18} color={BROWN} />
                        </button>
                      );
                    })
              }
            </div>
          </>
        ) : (
          // ─── CAFE MENU ───────────────────────────────────────────────
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => { setView('cafes'); setActiveCafe(null); setSearch(''); }}
                style={{ width: 38, height: 38, borderRadius: 12, background: '#fff', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <ArrowLeft size={17} color={INK} />
              </button>
              <div>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '-.4px', lineHeight: 1.1 }}>{activeCafe}</h1>
                <div style={{ fontSize: 12, fontWeight: 600, color: BROWN }}>{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={15} color={BROWN} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items…"
                style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px 11px 38px', borderRadius: 13, border: `1.5px solid ${BORDER}`, background: '#fff', fontSize: 14, fontFamily: 'inherit', fontWeight: 600, color: INK, outline: 'none' }} />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: BROWN, padding: 2, display: 'flex' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredItems.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: BROWN, fontSize: 13, fontWeight: 600 }}>
                  No items match "{search}"
                </div>
              )}
              {filteredItems.map(item => {
                const inCart = activeCafe ? cart.get(ck(activeCafe, item.name)) : undefined;
                return (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: INK, lineHeight: 1.3 }}>{item.name}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: BROWN, marginTop: 2 }}>Ordered {item.count}×</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: INK, flexShrink: 0, minWidth: 72, textAlign: 'right' }}>
                      GHS {fmtAmount(item.price)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                      {inCart ? (
                        <>
                          <button onClick={() => decItem(activeCafe!, item.name)}
                            style={{ width: 30, height: 30, borderRadius: 9, background: '#FBF0F0', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Minus size={12} color={RED} />
                          </button>
                          <span style={{ fontWeight: 800, fontSize: 14, color: INK, minWidth: 18, textAlign: 'center' }}>{inCart.qty}</span>
                          <button onClick={() => addItem(activeCafe!, item)}
                            style={{ width: 30, height: 30, borderRadius: 9, background: RED, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Plus size={12} color="#fff" />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => addItem(activeCafe!, item)}
                          style={{ width: 30, height: 30, borderRadius: 9, background: RED, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 3px 8px -3px rgba(216,30,44,.45)' }}>
                          <Plus size={12} color="#fff" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ─── FLOATING CART BUTTON ──────────────────────────────────── */}
      {cartCount > 0 && createPortal(
        <button onClick={() => setCartOpen(true)}
          style={{ position: 'fixed', bottom: fabBottom, right: isMobile ? 16 : 32, zIndex: 40, background: `linear-gradient(135deg,${RED},#8E0F18)`, color: '#fff', border: 'none', borderRadius: 99, padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 8px 28px -6px rgba(216,30,44,.55)', fontFamily: 'inherit' }}>
          <ShoppingCart size={18} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1 }}>{cartCount} item{cartCount !== 1 ? 's' : ''}</div>
            <div style={{ fontSize: 11, opacity: .85, marginTop: 2 }}>GHS {fmtAmount(cartTotal)}</div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: 99, background: canAfford ? '#4ade80' : '#fca5a5', marginLeft: 2, boxShadow: canAfford ? '0 0 5px #4ade80' : '0 0 5px #fca5a5' }} />
        </button>,
        document.body,
      )}

      {/* ─── CART SHEET ────────────────────────────────────────────── */}
      {createPortal(sheet, document.body)}
    </>
  );
}
