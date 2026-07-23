import { Link } from "react-router-dom";
import { Button } from "@/components/base/button";

export function CtaBanner() {
  return (
    <section className="landing py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance">
            Your links. Your data. No bloat.
          </h2>
          <div className="mt-6">
            <Button asChild>
              <Link to="/auth?intent=signup">
                Get started free <span aria-hidden="true">&rarr;</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
