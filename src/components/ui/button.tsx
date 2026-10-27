import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'vibrant' | 'mint' | 'royal' | 'saffron' | 'festive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none';

    const variants = {
      default:
        'bg-[#1e1b4b] text-white shadow-sm hover:bg-[#2e1065]',
      destructive:
        'bg-red-600 text-white shadow-sm hover:bg-red-700',
      outline:
        'border border-amber-900/20 bg-white/90 text-stone-800 shadow-2xs hover:bg-amber-50 hover:text-amber-950 hover:border-amber-500/40',
      secondary:
        'bg-[#fff7ed] text-[#9a3412] border border-[#fed7aa] shadow-2xs hover:bg-[#ffedd5]',
      ghost:
        'text-stone-700 hover:bg-amber-100/60 hover:text-stone-900',
      link: 'text-[#c2410c] underline-offset-4 hover:underline',
      vibrant:
        'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/25 hover:from-amber-600 hover:via-orange-600 hover:to-rose-700 border-0 font-bold',
      mint:
        'bg-[#d97706] text-white shadow-md shadow-amber-500/25 hover:bg-[#b45309] border-0 font-extrabold',
      royal:
        'bg-[#1e1b4b] text-amber-300 border border-amber-500/30 shadow-md shadow-indigo-950/30 hover:bg-[#2e1065] hover:text-amber-200 border-0 font-bold',
      saffron:
        'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black shadow-md shadow-orange-500/30 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 hover:shadow-lg border-0 tracking-wide',
      festive:
        'bg-gradient-to-r from-[#881337] via-[#9e1b32] to-[#b45309] text-white font-bold shadow-md shadow-rose-950/20 hover:from-[#9f1239] hover:to-[#d97706] border-0',
    };

    const sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-lg px-3 text-xs',
      lg: 'h-11 rounded-xl px-6 text-sm font-semibold',
      icon: 'h-9 w-9 rounded-lg',
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
