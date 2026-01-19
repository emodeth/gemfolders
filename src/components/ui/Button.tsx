import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'organizer-text-sm organizer-font-medium organizer-transition-colors',
  {
    variants: {
      variant: {
        default:
          'organizer-px-3 organizer-py-1.5 organizer-rounded-md organizer-text-white organizer-bg-neutral-700 hover:organizer-bg-neutral-600 organizer-text-white',
        cancel:
          'organizer-px-3 organizer-py-1.5 organizer-rounded-md organizer-text-white hover:organizer-bg-neutral-600 ',
        destructive:
          'organizer-px-3 organizer-py-1.5 organizer-rounded-md organizer-text-white organizer-bg-red-600 hover:organizer-bg-red-500',
        icon:
          'organizer-p-2 organizer-rounded-lg organizer-bg-[#2f2f2f] organizer-text-white hover:organizer-bg-[#212121] organizer-flex organizer-items-center organizer-justify-center',
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
