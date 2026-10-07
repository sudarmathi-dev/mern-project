const HeartIcon = ({ filled, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "var(--danger)" : "none"}
    stroke={filled ? "var(--danger)" : "currentColor"}
    strokeWidth="1.8"
  >
    <path d="M12 21s-6.7-4.35-9.33-8.2C.86 10.1 1.4 6.6 4.2 5.02c2.3-1.3 4.9-.6 6.3 1.24L12 7.9l1.5-1.64c1.4-1.84 4-2.54 6.3-1.24 2.8 1.58 3.34 5.08 1.53 7.78C18.7 16.65 12 21 12 21z" />
  </svg>
);

export default HeartIcon;
