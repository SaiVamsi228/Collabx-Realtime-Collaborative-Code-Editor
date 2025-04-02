import { cn } from '@/lib/utils';

export function Button({ children, className, variant, size, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border bg-transparent hover:bg-gray-100',
  };
  const sizes = {
    icon: 'h-10 w-10',
    default: 'h-10 px-4 py-2',
  };

  const variantStyles = variants[variant] || variants.default;
  const sizeStyles = sizes[size] || sizes.default;

  return (
    <button
      className={cn(baseStyles, variantStyles, sizeStyles, className)}
      {...props}
    >
      {children}
    </button>
  );
}