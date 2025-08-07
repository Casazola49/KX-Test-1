type AnimatedHamburgerIconProps = {
  open: boolean;
  className?: string;
  toggle?: () => void;
};

export function AnimatedHamburgerIcon({ open, className, toggle }: AnimatedHamburgerIconProps) {
  const genericHamburgerLine = `h-[3px] w-6 my-[3px] rounded-full bg-foreground transition ease transform duration-300`;
  return (
    <button
      className={`flex flex-col h-12 w-12 border-2 border-transparent rounded justify-center items-center group focus:outline-none ${className}`}
      onClick={toggle}
      aria-label={open ? "Cerrar menú" : "Abrir menú"}
      aria-expanded={open}
    >
      <div
        className={`${genericHamburgerLine} ${
          open
            ? "rotate-45 translate-y-[9px] opacity-100 group-hover:opacity-100"
            : "opacity-100 group-hover:opacity-100"
        }`}
      />
      <div className={`${genericHamburgerLine} ${open ? "opacity-0" : "opacity-100 group-hover:opacity-100"}`} />
      <div
        className={`${genericHamburgerLine} ${
          open
            ? "-rotate-45 -translate-y-[9px] opacity-100 group-hover:opacity-100"
            : "opacity-100 group-hover:opacity-100"
        }`}
      />
    </button>
  );
}
