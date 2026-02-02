import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'organizer-text-sm organizer-font-medium organizer-transition-colors',
  {
    variants: {
      variant: {
        default:
          'organizer-px-3 organizer-py-1.5 organizer-rounded-md organizer-text-text-primary organizer-bg-bg-surface-hover hover:organizer-opacity-90 organizer-text-text-primary organizer-cursor-pointer',
        cancel:
          'organizer-px-3 organizer-py-1.5 organizer-rounded-md organizer-text-text-primary hover:organizer-text-text-primary hover:organizer-bg-bg-surface-hover organizer-cursor-pointer',
        destructive:
          'organizer-px-3 organizer-py-1.5 organizer-rounded-md organizer-text-white organizer-bg-red-600 hover:organizer-bg-red-500 organizer-cursor-pointer',
        icon:
          'organizer-p-2 organizer-rounded-lg organizer-bg-bg-input organizer-text-text-primary hover:organizer-bg-bg-surface-hover organizer-flex organizer-items-center organizer-justify-center organizer-cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }

const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  children,
  ...props
}) => {
  return (
    <button className={cn(buttonVariants({ variant, className }))} {...props}>
      {children}
    </button>
  );
};

export { Button, buttonVariants };
