import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, ChevronRight, Minus, Plus, Search, X } from 'lucide-react';
import { CalculatorSkeleton } from '../../components/skeleton';
import { CafeBadge } from '../../components/cafe-badge';
import { AnimatedNumber } from '../../components/animated-number';
import { Sheet } from '../../components/sheet';
import { fetchHistory } from '../../api';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';
import { barSpring, bouncy, pageSpring, rise, spring, stagger, tapScale } from '../../lib/motion';
import { fmtMoney, todayISO } from '../../lib/utils';
import type { HistoryItem } from '../../types';

interface CartItem { cafe: string; name: string; price: number; qty: number }
interface MenuItem { name: string; price: number; count: number }
interface CafeData { cafe: string; items: MenuItem[] }

function nDaysAgoISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

const keyFor = (cafe: string, name: string) => `${cafe}::${name}`;

const menuVariants: Variants = {
  hidden: (direction: number) => ({ x: direction * 56, opacity: direction ? 0 : 1 }),
  show: { x: 0, opacity: 1, transition: { ...pageSpring, staggerChildren: 0.035 } },
  exit: (direction: number) => ({ x: direction * -56, opacity: 0, transition: pageSpring }),
};

function Stepper({ qty, name, onAdd, onRemove, variant = 'accent' }: { qty: number; name: string; onAdd: () => void; onRemove: () => void; variant?: 'accent' | 'soft' }) {
  return (
    <motion.div
      className={`stepper ${variant}`}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={bouncy}
    >
      <motion.button type="button" aria-label={`Remove one ${name}`} onClick={onRemove} whileTap={{ scale: 0.8 }} transition={bouncy}><Minus size={16} /></motion.button>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={qty} initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} transition={bouncy}>{qty}</motion.span>
      </AnimatePresence>
      <motion.button type="button" aria-label={`Add ${name}`} onClick={onAdd} whileTap={{ scale: 0.8 }} transition={bouncy}><Plus size={16} /></motion.button>
    </motion.div>
  );
}

export function CalculatorPage() {
  const { balanceData, isMobile } = useAppContext();
  const { studentId } = useSessionStore();
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

  // The menu slides the same way the café tabs are ordered, like page swipes.
  const cafeIndex = cafes.findIndex((entry) => entry.cafe === selectedCafe);
  const [menuSlide, setMenuSlide] = useState({ index: cafeIndex, direction: 0 });
  if (menuSlide.index !== cafeIndex) setMenuSlide({ index: cafeIndex, direction: Math.sign(cafeIndex - menuSlide.index) });
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!activeData) return [];
    return query ? activeData.items.filter((item) => item.name.toLowerCase().includes(query)) : activeData.items;
  }, [activeData, search]);

  const cartItems = Array.from(cart.values());
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const spentToday = history.filter((item) => item.date.slice(0, 10) === todayISO()).reduce((sum, item) => sum + item.cost * item.quantity, 0);
  const balance = Math.max(0, (balanceData?.daily_spending_limit ?? 0) - spentToday);
  const afterPurchase = balance - cartTotal;
  const over = afterPurchase < 0;

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

  if (isLoading) return <CalculatorSkeleton />;

  const orderContents = (inSheet: boolean) => (
    <>
      <div className="card-head">
        <div>
          <h2 className="card-title large">Your order</h2>
          <p className="card-sub">{cartCount} item{cartCount === 1 ? '' : 's'}</p>
        </div>
        {inSheet ? (
          <motion.button type="button" className="icon-button glass-soft" aria-label="Close order" onClick={() => setCartOpen(false)} whileTap={tapScale} transition={bouncy}><X size={18} /></motion.button>
        ) : cartCount > 0 && (
          <motion.button type="button" className="button ghost danger" onClick={() => setCart(new Map())} whileTap={tapScale} transition={bouncy}>Clear</motion.button>
        )}
      </div>
      <div className="order-items">
        <AnimatePresence initial={false} mode="popLayout">
          {cartItems.length === 0 ? (
            <motion.p key="empty" className="empty-note boxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Add items from the menu to see how they fit in today’s limit.
            </motion.p>
          ) : cartItems.map((item) => (
            <motion.div
              className="order-row"
              key={keyFor(item.cafe, item.name)}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.95 }}
              transition={spring}
            >
              <div className="list-text">
                <strong>{item.name}</strong>
                <small>{item.cafe} · {fmtMoney(item.price * item.qty)}</small>
              </div>
              <Stepper qty={item.qty} name={item.name} variant="soft" onAdd={() => addItem(item.cafe, item)} onRemove={() => decreaseItem(item.cafe, item.name)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="order-summary">
        <div className="summary-line"><span>Available today</span><strong>{fmtMoney(balance)}</strong></div>
        <div className="summary-line"><span>This order</span><strong><AnimatedNumber value={cartTotal} format={fmtMoney} /></strong></div>
        <div className="meter">
          <motion.span
            className={`meter-fill ${over ? 'accent' : 'ink'}`}
            style={{ width: '100%', originX: 0 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: balance > 0 ? Math.min(1, cartTotal / balance) : cartTotal > 0 ? 1 : 0 }}
            transition={barSpring}
          />
        </div>
        <div className="summary-line total">
          <span>Left after</span>
          <strong className={over ? 'text-bad' : 'text-good'}><AnimatedNumber value={afterPurchase} format={fmtMoney} /></strong>
        </div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={over ? 'over' : 'ok'}
          className={`status ${over ? 'bad' : 'good'}`}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={bouncy}
        >
          {over ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {over ? `${fmtMoney(-afterPurchase)} over today’s limit` : 'Fits within today’s limit'}
        </motion.div>
      </AnimatePresence>
      {inSheet && (
        <div className="sheet-actions">
          <motion.button type="button" className="button soft" onClick={() => setCart(new Map())} disabled={!cartCount} whileTap={tapScale} transition={bouncy}>Clear</motion.button>
          <motion.button type="button" className="button dark" onClick={() => setCartOpen(false)} whileTap={tapScale} transition={bouncy}>Done</motion.button>
        </div>
      )}
    </>
  );

  return (
    <>
      <motion.div className="page" variants={stagger} initial="hidden" animate="show">
        <motion.header className="page-header" variants={rise}>
          <div>
            <h1 className="page-title">Calculator</h1>
            <p className="page-subtitle">Add items to see what’s left of today’s limit.</p>
          </div>
        </motion.header>

        {cafes.length === 0 ? (
          <motion.div className="card empty-state" variants={rise}><strong>No menu yet</strong><p>Items you’ve bought in the last 6 months will appear here.</p></motion.div>
        ) : (
          <div className="columns">
            <motion.section className="column-main" aria-label="Menu" variants={rise}>
              <div role="group" aria-label="Choose a café" className="cafe-tabs glass-soft" data-no-swipe>
                {cafes.map(({ cafe, items }) => {
                  const active = cafe === selectedCafe;
                  const inCart = cartItems.filter((item) => item.cafe === cafe).reduce((sum, item) => sum + item.qty, 0);
                  return (
                    <motion.button
                      key={cafe}
                      type="button"
                      className={`cafe-tab ${active ? 'active' : ''}`}
                      aria-pressed={active}
                      onClick={() => { setActiveCafe(cafe); setSearch(''); }}
                      whileTap={tapScale}
                      transition={bouncy}
                    >
                      {active && <motion.span layoutId="cafe-pill" className="cafe-pill" transition={bouncy} />}
                      <CafeBadge name={cafe} size="sm" />
                      <span className="cafe-tab-name">{cafe}</span>
                      {inCart > 0 ? <motion.span className="count-badge" key={inCart} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={bouncy}>{inCart}</motion.span> : <small>{items.length}</small>}
                    </motion.button>
                  );
                })}
              </div>

              <label className="search-field glass-soft">
                <Search size={18} />
                <span className="sr-only">Search the menu</span>
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${selectedCafe ?? 'menu'}`} />
                <AnimatePresence>
                  {search && (
                    <motion.button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearch('')} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={bouncy}><X size={14} /></motion.button>
                  )}
                </AnimatePresence>
              </label>

              {filteredItems.length === 0 ? (
                <div className="card empty-state"><p>No items match “{search}”.</p></div>
              ) : (
                <AnimatePresence mode="popLayout" initial={false} custom={menuSlide.direction}>
                <motion.div
                  className="menu-grid"
                  key={selectedCafe}
                  custom={menuSlide.direction}
                  variants={menuVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  {filteredItems.map((item) => {
                    const qty = cart.get(keyFor(selectedCafe!, item.name))?.qty ?? 0;
                    return (
                      <motion.div className={`menu-card card ${qty ? 'in-cart' : ''}`} key={item.name} variants={rise}>
                        <div className="menu-text">
                          <strong>{item.name}</strong>
                          <small><span className="menu-price-inline">{fmtMoney(item.price)} · </span>Ordered {item.count}×</small>
                        </div>
                        <div className="menu-foot">
                          <span className="menu-price">{fmtMoney(item.price)}</span>
                          <AnimatePresence mode="popLayout" initial={false}>
                            {qty ? (
                              <Stepper key="stepper" qty={qty} name={item.name} onAdd={() => addItem(selectedCafe!, item)} onRemove={() => decreaseItem(selectedCafe!, item.name)} />
                            ) : (
                              <motion.button
                                key="add"
                                type="button"
                                className="add-button"
                                aria-label={`Add ${item.name}`}
                                onClick={() => addItem(selectedCafe!, item)}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                whileTap={{ scale: 0.82 }}
                                transition={bouncy}
                              >
                                <Plus size={18} />
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
                </AnimatePresence>
              )}
            </motion.section>

            {!isMobile && (
              <motion.aside className="column-side sticky-side" aria-label="Your order" variants={rise}>
                <div className="card order-card">{orderContents(false)}</div>
              </motion.aside>
            )}
          </div>
        )}
      </motion.div>

      {isMobile && createPortal(
        <AnimatePresence>
          {cartCount > 0 && !cartOpen && (
            <motion.button
              type="button"
              className="order-bar"
              onClick={() => setCartOpen(true)}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              whileTap={{ scale: 0.97 }}
              transition={bouncy}
            >
              <motion.span className="order-bar-count" key={cartCount} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={bouncy}>{cartCount}</motion.span>
              <span className="order-bar-text">
                <strong><AnimatedNumber value={cartTotal} format={fmtMoney} /></strong>
                <small className={over ? 'over' : ''}>{over ? `${fmtMoney(-afterPurchase)} over today’s limit` : `${fmtMoney(afterPurchase)} left today`}</small>
              </span>
              <span className="order-bar-cta">Review <ChevronRight size={15} /></span>
            </motion.button>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {isMobile && (
        <Sheet open={cartOpen} onClose={() => setCartOpen(false)} label="Your order">
          <div className="sheet-body">{orderContents(true)}</div>
        </Sheet>
      )}
    </>
  );
}
