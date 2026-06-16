import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Calendar, ChevronDown } from 'lucide-react';

function isoToDate(iso: string): Date {
  return new Date(iso + 'T00:00:00');
}

function dateToIso(d: Date): string {
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
}

function fmtDisplay(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(isoToDate(iso));
}

type SingleProps = {
  mode: 'single';
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: string;
};

type RangeProps = {
  mode: 'range';
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  max?: string;
};

type DatePickerPopoverProps = SingleProps | RangeProps;

export function DatePickerPopover(props: DatePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const label =
    props.mode === 'single'
      ? props.value
        ? fmtDisplay(props.value)
        : (props.placeholder ?? 'Pick a date')
      : props.from && props.to
        ? `${fmtDisplay(props.from)} – ${fmtDisplay(props.to)}`
        : props.from
          ? `From ${fmtDisplay(props.from)}…`
          : 'Pick a range';

  const hasValue = props.mode === 'single' ? !!props.value : !!(props.from || props.to);
  const maxDate = props.max ? isoToDate(props.max) : undefined;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: open ? '#fff' : '#F2E7DC',
          border: `1.5px solid ${open ? '#D81E2C' : '#ECE0D4'}`,
          borderRadius: 12, padding: '10px 14px',
          fontWeight: 600, fontSize: 13,
          color: hasValue ? '#1C1413' : '#7A6A63',
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all .15s', whiteSpace: 'nowrap',
          boxShadow: open ? '0 0 0 3px rgba(216,30,44,.12)' : 'none',
        }}
      >
        <Calendar size={14} style={{ color: '#D81E2C', flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{label}</span>
        <ChevronDown
          size={13}
          style={{
            color: '#7A6A63', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform .2s',
          }}
        />
      </button>

      {open && (
        <div
          className="rdp-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 300,
            background: '#fff',
            border: '1px solid #ECE0D4',
            borderRadius: 20,
            boxShadow: '0 24px 48px -12px rgba(60,15,8,.22), 0 0 0 1px rgba(226,210,196,.6)',
            overflow: 'hidden',
            fontSize: '13px',
            '--rdp-day-height': '34px',
            '--rdp-day-width': '34px',
            '--rdp-day_button-height': '32px',
            '--rdp-day_button-width': '32px',
            '--rdp-nav_button-height': '1.75rem',
            '--rdp-nav_button-width': '1.75rem',
            '--rdp-nav-height': '2.25rem',
          } as React.CSSProperties}
        >
          {props.mode === 'single' ? (
            <DayPicker
              mode="single"
              selected={props.value ? isoToDate(props.value) : undefined}
              onSelect={d => {
                if (d) { props.onChange(dateToIso(d)); setOpen(false); }
              }}
              disabled={maxDate ? { after: maxDate } : undefined}
            />
          ) : (
            <DayPicker
              mode="range"
              selected={
                props.from || props.to
                  ? {
                      from: props.from ? isoToDate(props.from) : undefined,
                      to: props.to ? isoToDate(props.to) : undefined,
                    }
                  : undefined
              }
              onSelect={range => {
                const f = range?.from ? dateToIso(range.from) : '';
                const t = range?.to ? dateToIso(range.to) : '';
                props.onChange(f, t);
                if (range?.to) setOpen(false);
              }}
              disabled={maxDate ? { after: maxDate } : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}
