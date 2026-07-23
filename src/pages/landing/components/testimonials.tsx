import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTestimonials } from "@/lib/data-provider";

export function Testimonials() {
  const testimonials = useTestimonials();
  return (
    <section className="landing py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">
            What people are saying
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-lg border border-border p-6">
              <blockquote className="text-sm text-foreground">
                "{t.quote}"
              </blockquote>
              <div className="mt-4 flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {t.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
