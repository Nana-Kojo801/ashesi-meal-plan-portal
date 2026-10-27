import { AnimatedNumber } from '../../../components/animated-number';
import { BrandMark } from '../../../components/header';
import { Ring } from '../../../components/ring';
import { useAppContext } from '../../../context/app-context';
import { fmtMoney } from '../../../lib/utils';

interface BalanceHeroProps {
  dailyLimit: number;
  spentToday: number;
  purchasesToday: number;
  totalLoaded: number;
}

export function BalanceHero({ dailyLimit, spentToday, purchasesToday, totalLoaded }: BalanceHeroProps) {
  const { isMobile } = useAppContext();
  const available = Math.max(0, dailyLimit - spentToday);
  const fraction = dailyLimit > 0 ? available / dailyLimit : 0;

  return (
    <section className="hero-card" aria-label="Today's balance">
      <span className="hero-gloss" aria-hidden="true" />
      <span className="hero-watermark" aria-hidden="true"><BrandMark size={isMobile ? 240 : 320} /></span>
      <div className="hero-top">
        <div className="hero-copy">
          <span className="hero-label">Available today</span>
          <div className="hero-amount">
            <span className="hero-currency">GHS</span>
            <AnimatedNumber value={available} className="hero-value" />
          </div>
          <span className="hero-sub">of {fmtMoney(dailyLimit)} · resets at midnight</span>
        </div>
        <Ring size={isMobile ? 96 : 156} strokeWidth={isMobile ? 10 : 14} fraction={fraction}>
          <strong>{Math.round(fraction * 100)}%</strong>
          <small>left{isMobile ? '' : ' today'}</small>
        </Ring>
      </div>
      <div className="hero-tiles">
        <div className="hero-tile">
          <span>Spent today</span>
          <strong><AnimatedNumber value={spentToday} format={fmtMoney} /></strong>
          <small>{purchasesToday} purchase{purchasesToday === 1 ? '' : 's'}</small>
        </div>
        <div className="hero-tile desktop-only">
          <span>Daily limit</span>
          <strong>{fmtMoney(dailyLimit)}</strong>
          <small>Resets at midnight</small>
        </div>
        <div className="hero-tile">
          <span>Total loaded</span>
          <strong><AnimatedNumber value={totalLoaded} format={fmtMoney} /></strong>
          <small>On your meal plan</small>
        </div>
      </div>
    </section>
  );
}
