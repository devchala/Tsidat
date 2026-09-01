export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-primary hover:bg-primaryDark text-white',
    outline: 'border border-primary text-primary hover:bg-primary/10',
    danger: 'bg-danger hover:bg-danger/90 text-white',
  };

  return (
    <button
      className={`px-4 py-2 rounded font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
