import { FadeIn } from '@/components/motion/FadeIn';
import { FadeInStagger } from '@/components/motion/FadeInStagger';
import type { ProductStep } from '@/lib/products';

interface ProductStepsProps {
  title: string;
  intro: string;
  steps: ProductStep[];
}

export function ProductSteps({ title, intro, steps }: ProductStepsProps) {
  return (
    <section
      id="como-pedir"
      aria-labelledby="product-steps-heading"
      className="bg-background py-20 lg:py-28"
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Sin complicaciones
          </p>
          <h2
            id="product-steps-heading"
            className="font-sans text-3xl font-semibold leading-tight tracking-tight text-foreground text-balance lg:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/55">
            {intro}
          </p>
          <div aria-hidden="true" className="mx-auto mt-6 h-px w-12 bg-accent" />
        </FadeIn>

        <div className="relative mt-16">
          {/* Conector horizontal (desktop) entre los 3 pasos */}
          <div
            aria-hidden="true"
            className="absolute left-[16.6%] right-[16.6%] top-5 z-0 hidden h-px bg-gradient-to-r from-border via-accent/25 to-border lg:block"
          />

          <FadeInStagger
            stagger={0.15}
            className="relative z-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6"
          >
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-sans text-sm font-semibold text-primary-foreground shadow-medium ring-4 ring-background">
                  {index + 1}
                </div>
                <h3 className="mt-6 font-sans text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/55">
                  {step.description}
                </p>
              </div>
            ))}
          </FadeInStagger>
        </div>
      </div>
    </section>
  );
}
