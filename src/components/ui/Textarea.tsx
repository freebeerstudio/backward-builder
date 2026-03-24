'use client';

import { forwardRef, useRef, useEffect, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, autoResize = false, id, rows = 4, className = '', onChange, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = (el: HTMLTextAreaElement | null) => {
      internalRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      }
    };

    const resize = () => {
      const el = internalRef.current;
      if (!el || !autoResize) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(() => {
      resize();
    });

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text font-body"
          >
            {label}
          </label>
        )}
        <textarea
          ref={setRefs}
          id={inputId}
          rows={rows}
          onChange={(e) => {
            resize();
            onChange?.(e);
          }}
          className={`
            w-full rounded-lg border border-border bg-white
            px-4 py-2.5 text-base text-text font-body
            placeholder:text-text-light
            focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20
            disabled:cursor-not-allowed disabled:opacity-50
            ${autoResize ? 'resize-none overflow-hidden' : ''}
            ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea, type TextareaProps };
