import { Link } from "react-router-dom";
import { Button } from "@/components/base/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-6 lg:px-8">
        <Link
          to="/"
          className="font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground"
        >
          LinkShort
        </Link>
        <Button variant="ghost" asChild>
          <Link to="/auth?intent=signin">Sign in</Link>
        </Button>
      </div>
    </header>
  );
}
