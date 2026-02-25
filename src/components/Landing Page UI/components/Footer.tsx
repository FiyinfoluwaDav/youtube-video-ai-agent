import { motion, useInView } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";
import { useRef, useState } from "react";

const socials = [
  {
    label: "Twitter",
    icon: <Twitter size={20} />,
    href: "https://twitter.com/OsokoyaF",
  },
  {
    label: "LinkedIn",
    icon: <Linkedin size={20} />,
    href: "https://www.linkedin.com/in/fiyinfoluwa-osokoya/",
  },
  {
    label: "GitHub",
    icon: <Github size={20} />,
    href: "https://github.com/FiyinfoluwaDav",
  },
];

export default function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <footer
      id="contact"
      className="relative py-32 bg-background border-t border-border"
      ref={ref}
    >
      <div className="relative z-10 container mx-auto px-4">
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="font-display text-xs tracking-wider font-semibold text-primary mb-4 uppercase">
            Contact Us
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get in <span className="text-primary">Touch</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-4xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-display text-xs tracking-wider font-medium text-foreground uppercase mb-2 block">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Fiyinfoluwa"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="font-display text-xs tracking-wider font-medium text-foreground uppercase mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="info@orizenlabs.com"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="font-display text-xs tracking-wider font-medium text-foreground uppercase mb-2 block">
                  Your Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="How can we help you?"
                  rows={4}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <span>{sent ? "✓ Message Sent!" : "Send Message →"}</span>
              </button>
            </form>
          </motion.div>

          {/* Info + Socials */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col justify-between"
          >
            <div>
              <div className="font-display text-3xl font-black text-foreground mb-4 tracking-widest">
                SUMMARA
              </div>
              <p className="font-body text-muted-foreground text-sm leading-relaxed mb-8 max-w-xs">
                Built by Fiyinfoluwa @ OrizenLabs
              </p>

              {/* Social */}
              <div>
                <p className="font-display text-xs tracking-wider font-medium text-foreground uppercase mb-4">
                  Socials
                </p>
                <div className="flex gap-4">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-all hover:-translate-y-1"
                      title={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Final tagline */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="font-display text-sm text-foreground font-bold mb-2">
                Stop watching. Start understanding.
              </p>
              <p className="font-body text-muted-foreground text-xs">
                © {new Date().getFullYear()} Orizen AI Labs. All rights
                reserved.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
