import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'organizer-w-full organizer-bg-bg-input organizer-rounded-md organizer-px-3 organizer-py-2 organizer-text-text-primary organizer-text-sm organizer-border organizer-outline-none organizer-placeholder-text-muted organizer-transition-colors focus:organizer-border-blue-500',
  {
    variants: {
      variant: {
        default: 'organizer-border-border-default',
        ghost: 'organizer-border-bg-input',
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
