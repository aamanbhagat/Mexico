/**
 * Form primitives for calculator islands. Native elements first: real <input>, <fieldset>
 * and radio buttons give keyboard support, autofill and screen-reader semantics for free.
 */
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useState } from 'preact/hooks';
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
}: MoneyFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(value === null ? '' : String(value));

  useEffect(() => {
    if (!focused) setText(value === null ? '' : String(value));
  }, [value, focused]);

  const display = focused || value === null ? text : decimals === 0 ? String(value) : formatAmount(value);

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div class="input-affix">
        {prefix ? (
          <span class="input-affix__prefix" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
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
            setText(value === null ? '' : String(value));
          }}
          onBlur={() => setFocused(false)}
          onInput={(e) => {
            const raw = (e.currentTarget as HTMLInputElement).value;
            setText(raw);
            onChange(parseAmount(raw));
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
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
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
export function Segmented<T extends string>({ legend, name, value, options, onChange, hint, legendHidden }: SegmentedProps<T>) {
  const id = useId();
  return (
    <fieldset class="field segmented" aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend class={legendHidden ? 'sr-only' : 'field__label'}>{legend}</legend>
      <div class="segmented__track">
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
  return (
    <fieldset class="field radio-cards">
      <legend class="field__label">{legend}</legend>
      <div class="radio-cards__list">
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
  return (
    <div class="field switch">
      <input
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
