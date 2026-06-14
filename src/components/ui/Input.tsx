import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'organizer-w-full organizer-rounded-lg organizer-px-4 organizer-py-2 organizer-text-text-primary organizer-text-sm organizer-font-normal organizer-outline-none organizer-placeholder-text-placeholder organizer-transition-colors',
  {
    variants: {
      variant: {
        default: 'organizer-bg-bg-input organizer-border organizer-border-border-default focus:organizer-border-[var(--color-primary)]',
        ghost: 'organizer-bg-bg-input organizer-border organizer-border-border-default focus:organizer-border-[var(--color-primary)]',
        secondary: 'organizer-bg-bg-background organizer-border organizer-border-bg-background focus:organizer-border-[var(--color-primary)]',
        borderless: 'organizer-bg-bg-primary organizer-border-0 focus:organizer-outline-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
  VariantProps<typeof inputVariants> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ variant, className }))}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
