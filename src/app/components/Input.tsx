import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="font-heading uppercase text-accent-gold text-[11px] tracking-widest">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'bg-bg-tertiary border border-accent-gold text-text-primary px-4 py-3 font-mono focus:outline-none focus:border-accent-gold focus:glow-gold transition-all',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
