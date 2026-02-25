import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { useRef, useState } from "react";

const plans = [
  {
    name: "Free",
    tier: "Free",
    price: "$0",
    period: "/forever",
    description: "Perfect for getting started.",
    features: [
      "10 prompts per day",
      "3 PDF generations per week",
      "Watermarked PDF export",
      "Limited storage (7-day history)",
      "Max 20 min video length",
      "Basic summary (short paragraph)",
      "1 mindmap per week",
      "Free transcript download",
    ],
    color: "hsl(var(--primary))",
    glowColor: "hsl(var(--primary) / 0.3)",
    popular: false,
  },
  {
    name: "Go",
    tier: "Go",
    price: "$2.5",
    period: "/month",
    description: "For growing needs and better exports.",
    features: [
      "25 prompts per day",
      "Max 60-minute videos",
      "10 PDF generations per week",
      "7 mindmaps per week",
      "Clean PDF export (no watermark)",
      "30-day history",
      "Free transcript download",
    ],
    color: "hsl(var(--primary))",
    glowColor: "hsl(var(--primary) / 0.4)",
    popular: true,
  },
  {
    name: "Pro",
    tier: "Pro",
    price: "$5",
    period: "/month",
    description: "Unlimited access and advanced features.",
    features: [
      "40 prompts per day",
      "Unlimited history",
      "Early access to new features",
      "Unlimited video length",
      "25 PDF generations per week",
      "15 mindmaps per week",
      "Free transcript download",
    ],
    color: "hsl(var(--primary))",
    glowColor: "hsl(var(--primary) / 0.5)",
    popular: false,
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(1); // Go hovered by default

  return (
    <section
      id="pricing"
      className="relative py-32 bg-background flex flex-col items-center"
      ref={ref}
    >
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="font-display text-sm font-semibold tracking-wider text-primary mb-4 uppercase">
            Pricing Plans
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
            Choose Your Plan
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            Stop watching. Start understanding.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              onHoverStart={() => setHoveredPlan(i)}
              onHoverEnd={() => setHoveredPlan(null)}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 font-display text-xs font-bold tracking-widest px-4 py-1.5 rounded-full z-20 bg-primary text-primary-foreground shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div
                className={`bg-card border rounded-3xl p-8 text-center h-full flex flex-col transition-all duration-500 relative overflow-hidden ${
                  hoveredPlan === i
                    ? "border-primary shadow-2xl"
                    : "border-border"
                }`}
                style={{
                  transform: hoveredPlan === i ? "translateY(-8px)" : "none",
                  boxShadow:
                    hoveredPlan === i
                      ? `0 20px 40px -15px ${plan.glowColor}`
                      : "none",
                }}
              >
                {hoveredPlan === i && (
                  <div className="absolute inset-0 bg-primary/5 pointer-events-none transition-opacity duration-500" />
                )}

                <div className="font-display text-xl font-semibold mb-2 text-foreground relative z-10">
                  {plan.name}
                </div>
                <div className="font-display text-4xl font-black text-foreground mb-2 relative z-10">
                  {plan.price}
                  <span className="font-body text-base text-muted-foreground font-normal">
                    {plan.period}
                  </span>
                </div>
                <p className="font-body text-muted-foreground text-sm mb-8 leading-relaxed relative z-10">
                  {plan.description}
                </p>

                <ul className="text-left space-y-4 mb-8 flex-1 relative z-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 text-primary">
                        <Check size={16} strokeWidth={3} />
                      </div>
                      <span className="font-body text-sm text-foreground/80">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-full font-display text-sm font-semibold transition-all duration-300 relative z-10 ${
                    hoveredPlan === i
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  {plan.tier === "Free" ? "Start Free" : `Get ${plan.tier}`}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center font-body text-muted-foreground text-sm mt-12"
        >
          All plans include a 14-day free trial. No credit card required. Cancel
          anytime.
        </motion.p>
      </div>
    </section>
  );
}
