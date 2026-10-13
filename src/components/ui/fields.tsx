/**
 * Form primitives for calculator islands. Native elements first: real <input>, <fieldset>
 * and radio buttons give keyboard support, autofill and screen-reader semantics for free.
 */
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useRef, useState } from 'preact/hooks';

/**
 * Islands hydrate a moment after the HTML is visible. On a slow phone someone can type or tap
 * before that; the browser keeps those edits in the DOM but the component never saw them.
 * On mount we adopt whatever the DOM holds if it differs from what we rendered.
 */
function useAdoptPreHydrationValue(read: () => string | null, rendered: string, adopt: (domValue: string) => void) {
  useEffect(() => {
    const dom = read();
    if (dom !== null && dom !== rendered) adopt(dom);
    // Mount only: later edits flow through the normal handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
import { formatAmount, parseAmount } from '../../lib/ui/format';

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ComponentChildren;
  class?: string | undefined;
}

function FieldShell({ id, label, hint, error, children, class: cls }: FieldShellProps) {
  return (
    <div class={`field ${error ? 'field--invalid' : ''} ${cls ?? ''}`}>
      <label class="field__label" for={id}>
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p class="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p class="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

/* ------------------------------------------------------------------------------------------ */

interface MoneyFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  hint?: string;
  error?: string | undefined;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  name: string;
  /** Decimal places shown when not focused. */
  decimals?: 0 | 2;
  autoFocus?: boolean;
  /** Reads typed text (default: es-MX money). */
  parse?: (text: string) => number | null;
  /** Writes the value when the field is not focused (default: es-MX with `decimals`). */
  format?: (value: number) => string;
  /** Text shown while editing (default: String(value)). */
  editText?: (value: number) => string;
}

/**
 * Money/number input: opens the numeric keypad (inputmode="decimal"), accepts "15,000.50",
 * shows thousands separators when not focused and keeps the raw text while editing.
 */
export function MoneyField({
  label,
  value,
  onChange,
  hint,
  error,
  prefix = '$',
  suffix,
  placeholder,
  name,
  decimals = 2,
  parse = parseAmount,
  format,
  editText = String,
}: MoneyFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(value === null ? '' : editText(value));

  useEffect(() => {
    if (!focused) setText(value === null ? '' : editText(value));
    // editText is a pure formatter; re-running on identity changes would reset typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, focused]);

  const shown = format ?? ((v: number) => (decimals === 0 ? String(v) : formatAmount(v)));
  const display = focused || value === null ? text : shown(value);
  const inputRef = useRef<HTMLInputElement>(null);
  useAdoptPreHydrationValue(
    () => inputRef.current?.value ?? null,
    display,
    (dom) => {
      setText(dom);
      onChange(parse(dom));
    },
  );

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div class={prefix && prefix.length > 1 ? 'input-affix input-affix--wide' : 'input-affix'}>
        {prefix ? (
          <span class="input-affix__prefix" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          ref={inputRef}
          id={id}
          name={name}
          class="input input--num"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="done"
          spellcheck={false}
          placeholder={placeholder}
          value={display}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(id, hint, error)}
          onFocus={() => {
            setFocused(true);
            setText(value === null ? '' : editText(value));
          }}
          onBlur={() => setFocused(false)}
          onInput={(e) => {
            const raw = (e.currentTarget as HTMLInputElement).value;
            setText(raw);
            onChange(parse(raw));
          }}
        />
        {suffix ? (
          <span class="input-affix__suffix" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldShell>
  );
}

/* ------------------------------------------------------------------------------------------ */

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string | undefined;
  error?: string | undefined;
  min?: string;
  max?: string;
  name: string;
}

/** Native date input: localized picker on phones, full keyboard support on desktop, zero JS cost. */
export function DateField({ label, value, onChange, hint, error, min, max, name }: DateFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  useAdoptPreHydrationValue(
    () => inputRef.current?.value || null,
    value,
    (dom) => onChange(dom),
  );
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        class="input input--date"
        type="date"
        value={value}
        min={min}
        max={max}
        required
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        onInput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          if (v) onChange(v);
        }}
      />
    </FieldShell>
  );
}

/* ------------------------------------------------------------------------------------------ */

interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SegmentedProps<T extends string> {
  legend: string;
  name: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  hint?: string;
  /** Hide the legend visually (still announced). */
  legendHidden?: boolean;
}

/** Segmented control built from native radios inside a fieldset (arrow keys move the choice). */
function useAdoptCheckedRadio<T extends string>(value: T, onChange: (v: T) => void) {
  const ref = useRef<HTMLDivElement>(null);
  useAdoptPreHydrationValue(
    () => ref.current?.querySelector<HTMLInputElement>('input[type=radio]:checked')?.value ?? null,
    value,
    (dom) => onChange(dom as T),
  );
  return ref;
}

export function Segmented<T extends string>({ legend, name, value, options, onChange, hint, legendHidden }: SegmentedProps<T>) {
  const id = useId();
  const trackRef = useAdoptCheckedRadio(value, onChange);
  return (
    <fieldset class="field segmented" aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend class={legendHidden ? 'sr-only' : 'field__label'}>{legend}</legend>
      <div class="segmented__track" ref={trackRef}>
        {options.map((o) => (
          <label class="segmented__option" key={o.value}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {hint ? (
        <p class="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Larger radio choices with a description line (separation cause). */
export function RadioCards<T extends string>({ legend, name, value, options, onChange }: SegmentedProps<T>) {
  const listRef = useAdoptCheckedRadio(value, onChange);
  return (
    <fieldset class="field radio-cards">
      <legend class="field__label">{legend}</legend>
      <div class="radio-cards__list" ref={listRef}>
        {options.map((o) => (
          <label class="radio-card" key={o.value}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span class="radio-card__body">
              <span class="radio-card__title">{o.label}</span>
              {o.description ? <span class="radio-card__desc">{o.description}</span> : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------------------------------ */

interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  name: string;
  disabled?: boolean;
}

/** A checkbox with switch styling (role="switch" so it announces on/off). */
export function Switch({ label, checked, onChange, hint, name, disabled }: SwitchProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  useAdoptPreHydrationValue(
    () => (inputRef.current ? String(inputRef.current.checked) : null),
    String(checked),
    (dom) => onChange(dom === 'true'),
  );
  return (
    <div class="field switch">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="checkbox"
        role="switch"
        class="switch__input"
        checked={checked}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange((e.currentTarget as HTMLInputElement).checked)}
      />
      <label class="switch__label" for={id}>
        <span class="switch__track" aria-hidden="true">
          <span class="switch__thumb" />
        </span>
        <span>{label}</span>
      </label>
      {hint ? (
        <p class="field__hint switch__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectGroup<T extends string> {
  label: string;
  options: readonly SelectOption<T>[];
}

interface SelectFieldProps<T extends string> {
  label: string;
  name: string;
  value: T;
  /** Flat options and/or labelled groups (rendered as <optgroup>). */
  options: readonly (SelectOption<T> | SelectGroup<T>)[];
  onChange: (value: T) => void;
  hint?: string | undefined;
  class?: string | undefined;
  /** Hide the label visually (still announced). */
  labelHidden?: boolean;
}

/** Native <select>: the platform picker on phones, type-ahead and arrow keys everywhere. */
export function SelectField<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
  hint,
  class: cls,
  labelHidden,
}: SelectFieldProps<T>) {
  const id = useId();
  const ref = useRef<HTMLSelectElement>(null);
  useAdoptPreHydrationValue(
    () => ref.current?.value ?? null,
    value,
    (dom) => onChange(dom as T),
  );
  return (
    <div class={`field field--select ${cls ?? ''}`}>
      <label class={labelHidden ? 'sr-only' : 'field__label'} for={id}>
        {label}
      </label>
      <div class="select">
        <select
          ref={ref}
          id={id}
          name={name}
          class="input select__input"
          value={value}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange((e.currentTarget as HTMLSelectElement).value as T)}
        >
          {options.map((o) =>
            'options' in o ? (
              <optgroup label={o.label} key={o.label}>
                {o.options.map((x) => (
                  <option value={x.value} key={x.value}>
                    {x.label}
                  </option>
                ))}
              </optgroup>
            ) : (
              <option value={o.value} key={o.value}>
                {o.label}
              </option>
            ),
          )}
        </select>
      </div>
      {hint ? (
        <p class="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */

interface DatePartsProps {
  legend: string;
  name: string;
  /** ISO date, or '' when empty. */
  value: string;
  /** Called with the ISO date when the three parts form a real date, otherwise null. */
  onChange: (iso: string | null) => void;
  monthNames: readonly string[];
  labels: { day: string; month: string; year: string; choose: string };
  hint?: string | undefined;
  error?: string | undefined;
  /** Use the browser's birthday autofill (bday-day/-month/-year). */
  birthday?: boolean;
}

interface Parts {
  d: string;
  m: string;
  y: string;
}

const pad2 = (n: string) => n.padStart(2, '0');

function partsOf(iso: string): Parts {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? { y: m[1] as string, m: String(Number(m[2])), d: String(Number(m[3])) } : { d: '', m: '', y: '' };
}

function isoOf(p: Parts): string | null {
  if (!/^\d{1,2}$/.test(p.d) || !/^\d{1,2}$/.test(p.m) || !/^\d{4}$/.test(p.y)) return null;
  const iso = `${p.y}-${pad2(p.m)}-${pad2(p.d)}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso ? iso : null;
}

/**
 * A memorable date (birth date) as three fields: day and year open the numeric keypad, the month
 * is a native select with localized names. Easier than a calendar picker for dates decades ago,
 * and every part is a real labelled control for screen readers and autofill.
 */
export function DatePartsField({ legend, name, value, onChange, monthNames, labels, hint, error, birthday = true }: DatePartsProps) {
  const id = useId();
  const [parts, setParts] = useState<Parts>(() => partsOf(value));
  const rowRef = useRef<HTMLDivElement>(null);

  // Follow external changes (URL state, examples) unless the fields already say the same date.
  useEffect(() => {
    if (value && isoOf(parts) !== value) setParts(partsOf(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const update = (patch: Partial<Parts>) => {
    const next = { ...parts, ...patch };
    setParts(next);
    onChange(isoOf(next));
  };

  useAdoptPreHydrationValue(
    () => {
      const el = rowRef.current;
      if (!el) return null;
      const [d, m, y] = ['d', 'm', 'y'].map((k) => (el.querySelector(`[data-part="${k}"]`) as HTMLInputElement | null)?.value ?? '');
      return JSON.stringify({ d, m, y });
    },
    JSON.stringify(parts),
    (dom) => update(JSON.parse(dom) as Parts),
  );

  const described = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <fieldset class={`field date-parts ${error ? 'field--invalid' : ''}`} aria-describedby={described}>
      <legend class="field__label">{legend}</legend>
      <div class="date-parts__row" ref={rowRef}>
        <div class="date-parts__item date-parts__item--day">
          <label class="date-parts__label" for={`${id}-d`}>
            {labels.day}
          </label>
          <input
            id={`${id}-d`}
            name={`${name}-d`}
            data-part="d"
            class="input input--num"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            autoComplete={birthday ? 'bday-day' : 'off'}
            enterKeyHint="next"
            value={parts.d}
            aria-invalid={error ? 'true' : undefined}
            onInput={(e) => update({ d: (e.currentTarget as HTMLInputElement).value.replace(/\D/g, '').slice(0, 2) })}
          />
        </div>
        <div class="date-parts__item date-parts__item--month">
          <label class="date-parts__label" for={`${id}-m`}>
            {labels.month}
          </label>
          <select
            id={`${id}-m`}
            name={`${name}-m`}
            data-part="m"
            class="input input--select"
            autoComplete={birthday ? 'bday-month' : 'off'}
            value={parts.m}
            aria-invalid={error ? 'true' : undefined}
            onChange={(e) => update({ m: (e.currentTarget as HTMLSelectElement).value })}
          >
            <option value="">{labels.choose}</option>
            {monthNames.map((n, i) => (
              <option key={n} value={String(i + 1)}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div class="date-parts__item date-parts__item--year">
          <label class="date-parts__label" for={`${id}-y`}>
            {labels.year}
          </label>
          <input
            id={`${id}-y`}
            name={`${name}-y`}
            data-part="y"
            class="input input--num"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            autoComplete={birthday ? 'bday-year' : 'off'}
            enterKeyHint="done"
            value={parts.y}
            aria-invalid={error ? 'true' : undefined}
            onInput={(e) => update({ y: (e.currentTarget as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4) })}
          />
        </div>
      </div>
      {hint && !error ? (
        <p class="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p class="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
