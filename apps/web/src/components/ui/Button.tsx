import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-full transition-all duration-300 inline-flex items-center justify-center';

  const variants = {
    primary: 'bg-woli-pink hover:bg-woli-pink-dark text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-woli-pink text-woli-pink hover:bg-woli-pink hover:text-white',
    ghost: 'text-woli-dark hover:text-woli-pink',
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
