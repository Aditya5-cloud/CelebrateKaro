import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'vibrant' | 'mint' | 'royal' | 'saffron' | 'festive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7418F] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] select-none';

    const variants = {
      default:
        'bg-[#F7418F] text-white shadow-xs hover:bg-[#e02b78] border border-[#F7418F]',
      destructive:
        'bg-red-600 text-white shadow-xs hover:bg-red-700 border border-red-700',
      outline:
        'border-2 border-[#F7418F] bg-transparent text-[#F7418F] hover:bg-[#F7418F] hover:text-white',
      secondary:
        'bg-[#FEC7B4] text-[#2A0E1C] border border-[#FC819E] hover:bg-[#FC819E] hover:text-white',
      ghost:
        'text-[#2A0E1C] hover:bg-[#FEC7B4]/50 hover:text-[#F7418F] border border-transparent',
      link: 'text-[#F7418F] underline-offset-4 hover:underline',
      vibrant:
        'bg-[#F7418F] text-white hover:bg-[#e02b78] shadow-sm border border-[#F7418F] font-bold',
      mint:
        'bg-[#FC819E] text-white hover:bg-[#F7418F] shadow-xs border border-[#FC819E] font-bold',
      royal:
        'bg-[#2A0E1C] text-[#FFF3C7] hover:bg-[#3D1429] border border-[#2A0E1C] font-bold',
      saffron:
        'bg-[#F7418F] text-white font-bold hover:bg-[#e02b78] border border-[#F7418F] tracking-wide shadow-sm',
      festive:
        'bg-gradient-to-r from-[#F7418F] via-[#FC819E] to-[#F7418F] text-white font-bold hover:opacity-95 border border-[#F7418F]',
    };

    const sizes = {
      default: 'h-10 px-5 py-2',
      sm: 'h-8 px-3 text-xs',
      lg: 'h-12 px-8 text-sm font-bold',
      icon: 'h-9 w-9',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
