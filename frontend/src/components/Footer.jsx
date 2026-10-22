import { Link } from "react-router-dom";
import { PawPrint, Heart, Mail, Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-forest-500 rounded-xl flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Paw<span className="text-amber">Pal</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Connecting loving families with pets who deserve a forever home.
              Every adoption changes two lives — the pet's and yours.
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social link"
                   className="w-9 h-9 rounded-lg bg-forest-700 flex items-center justify-center
                              hover:bg-forest-500 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/",    label: "Home" },
                { to: "/pets", label: "Find a Pet" },
                { to: "/my-applications", label: "My Applications" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to}
                    className="text-gray-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm">
              <a href="mailto:adopt@pawpal.org"
                 className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> adopt@pawpal.org
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-forest-700 mt-10 pt-6 flex flex-col sm:flex-row
                        items-center justify-between gap-2 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} PawPal. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-coral fill-coral" /> for pets everywhere
          </span>
        </div>
      </div>
    </footer>
  );
}
