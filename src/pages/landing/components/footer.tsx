import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto flex max-w-page flex-col items-center gap-3 px-6 text-center lg:px-8">
        <Link
          to="/"
          className="font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground"
        >
          LinkShort
        </Link>
        <p className="text-sm text-muted-foreground">
          Short links. Real insights. Built for makers and solo operators.
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} LinkShort. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
