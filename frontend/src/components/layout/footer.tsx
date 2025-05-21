import Link from "next/link"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"

const footerLinks = {
  tools: [
    { name: "Image Tools", href: "/tools/image" },
    { name: "Document Tools", href: "/tools/document" },
    { name: "Audio Tools", href: "/tools/audio" },
    { name: "Video Tools", href: "/tools/video" },
    { name: "PDF Tools", href: "/tools/pdf" },
    { name: "Code Tools", href: "/tools/code" },
  ],
  resources: [
    { name: "Documentation", href: "/docs" },
    { name: "API Reference", href: "/api" },
    { name: "Blog", href: "/blog" },
    { name: "Tutorials", href: "/tutorials" },
    { name: "Updates", href: "/updates" },
  ],
  company: [
    { 
      name: "About Us",
      href: "/about",
      description: "Our mission, vision, and what makes AllKit unique."
    },
    { 
      name: "Why Free",
      href: "/why-free",
      description: "Learn why we provide these tools for free."
    },
    { 
      name: "Contact Us",
      href: "/contact",
      description: "Get in touch for support, feedback, or partnerships."
    },
    { 
      name: "Careers",
      href: "/careers",
      description: "Join our team and help build the future of online tools."
    },
  ],
  legal: [
    { 
      name: "Privacy Policy",
      href: "/privacy-policy",
      description: "How we handle your data and privacy."
    },
    { 
      name: "Terms & Conditions",
      href: "/terms",
      description: "User responsibilities, disclaimers, and more."
    },
    { 
      name: "Cookie Policy",
      href: "/cookie-policy",
      description: "How we use cookies and similar technologies."
    },
    { 
      name: "GDPR Compliance",
      href: "/gdpr",
      description: "Our commitment to data protection and privacy."
    },
  ],
  social: [
    { name: "GitHub", icon: Github, href: "https://github.com/allkit" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/allkit" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/allkit" },
    { name: "Email", icon: Mail, href: "mailto:contact@allkit.com" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tools Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tools</h3>
            <ul className="grid gap-2">
              {footerLinks.tools.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="grid gap-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="grid gap-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm font-medium hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {link.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="grid gap-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm font-medium hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {link.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links & Newsletter */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect With Us</h3>
            <div className="flex gap-4">
              {footerLinks.social.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={link.name}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest updates, new tools, and tips.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} AllKit. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 