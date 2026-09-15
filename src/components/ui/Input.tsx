import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'organizer-w-full organizer-rounded-lg organizer-border-0 organizer-px-4 organizer-py-2.5 organizer-text-text-primary organizer-text-sm organizer-font-normal organizer-outline-none placeholder:organizer-text-text-placeholder organizer-transition-colors',
  {
    variants: {
      variant: {
        default: 'organizer-bg-bg-input focus:organizer-bg-bg-input-focus',
        ghost: 'organizer-bg-bg-input focus:organizer-bg-bg-input-focus',
        secondary: 'organizer-bg-bg-card focus:organizer-bg-bg-input-focus',
        borderless: 'organizer-bg-transparent focus:organizer-bg-bg-surface-hover',
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
