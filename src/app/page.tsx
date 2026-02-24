import Link from "next/link";
import { ArrowRight, BarChart3, MessageSquare, Star, Users, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Fidelyz</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
            <Link
              href="/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Get started free
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Zap size={14} />
              AI-powered loyalty platform
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Grow your business with
              <span className="text-indigo-600"> loyalty programs</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Fidelyz helps B2B businesses create engaging loyalty programs, send multi-channel messages,
              and analyze customer behavior — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Start for free
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Everything you need to retain customers</h2>
              <p className="text-gray-600 mt-3">A complete platform for managing customer loyalty</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Users, title: "Customer Management", desc: "Track all your customers, their points, purchase history, and engagement levels in one place.", color: "text-blue-600 bg-blue-50" },
                { icon: MessageSquare, title: "Multi-channel Messaging", desc: "Send personalized messages via email, SMS, push notifications, and WhatsApp.", color: "text-green-600 bg-green-50" },
                { icon: BarChart3, title: "Advanced Analytics", desc: "Get deep insights into campaign performance, customer behavior, and ROI.", color: "text-purple-600 bg-purple-50" },
                { icon: Star, title: "Points & Rewards", desc: "Create customizable points systems and reward programs that keep customers coming back.", color: "text-yellow-600 bg-yellow-50" },
                { icon: Zap, title: "AI-powered Insights", desc: "Let AI help you craft the perfect messages and identify your most valuable customers.", color: "text-orange-600 bg-orange-50" },
                { icon: ArrowRight, title: "Public Loyalty Pages", desc: "Create beautiful branded pages for customers to join and track their loyalty status.", color: "text-indigo-600 bg-indigo-50" },
              ].map((feature) => (
                <div key={feature.title} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h2>
            <p className="text-gray-600 mb-12">Start free, upgrade as you grow</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Free", price: "€0", features: ["100 customers", "1 campaign/month", "Email only"], cta: "Get started", href: "/register" },
                { name: "Starter", price: "€29", features: ["1,000 customers", "10 campaigns/month", "Email + SMS"], cta: "Start trial", href: "/register" },
                { name: "Pro", price: "€99", popular: true, features: ["10,000 customers", "Unlimited campaigns", "All channels"], cta: "Start trial", href: "/register" },
                { name: "Enterprise", price: "€299", features: ["Unlimited customers", "Unlimited campaigns", "Dedicated support"], cta: "Contact us", href: "/register" },
              ].map((plan) => (
                <div key={plan.name} className={`bg-white rounded-2xl border p-6 text-left ${plan.popular ? "border-indigo-500 ring-2 ring-indigo-500/20 relative" : "border-gray-200"}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most popular
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-3xl font-bold mt-2">{plan.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                  <ul className="mt-4 mb-6 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-green-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block text-center py-2 px-4 rounded-xl text-sm font-medium transition-colors ${plan.popular ? "bg-indigo-600 text-white hover:bg-indigo-700" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-8 px-4 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Fidelyz. All rights reserved.</p>
      </footer>
    </div>
  );
}
