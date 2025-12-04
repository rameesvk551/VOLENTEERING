import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, Facebook, Instagram, Twitter, Linkedin, Youtube, Globe, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const FooterSection = () => {
  const [openModal, setOpenModal] = useState<null | "about" | "contact" | "terms" | "privacy">(null);

  const closeModal = () => setOpenModal(null);

  const footerLinks = {
    explore: [
      { label: "Volunteering", href: "/volunteering-oppertunities" },
      { label: "Hosts", href: "/hosts" },
      { label: "Destinations", href: "/destinations" },
      { label: "How It Works", href: "/how-it-works" },
    ],
    host: [
      { label: "Become a Host", href: "/host/signup" },
      { label: "Host Resources", href: "/host-resources" },
      { label: "Community Guidelines", href: "/guidelines" },
      { label: "Host FAQ", href: "/host-faq" },
    ],
    company: [
      { label: "About Us", action: () => setOpenModal("about") },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", action: () => setOpenModal("contact") },
    ],
    support: [
      { label: "Help Center", href: "/help" },
      { label: "Safety", href: "/safety" },
      { label: "Terms", action: () => setOpenModal("terms") },
      { label: "Privacy", action: () => setOpenModal("privacy") },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  const renderModalContent = () => {
    switch (openModal) {
      case "about":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">About RAIH</h2>
            <p className="text-gray-600 mb-4">
              RAIH is a global platform connecting travelers with hosts around the world through meaningful cultural exchanges.
            </p>
            <p className="text-gray-600">
              Our mission is to make travel more accessible, sustainable, and enriching for everyone.
            </p>
          </>
        );
      case "contact":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:support@raih.com" className="text-primary hover:underline">support@raih.com</a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Global Operations</span>
              </div>
            </div>
          </>
        );
      case "terms":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
            <p className="text-gray-600">
              By using RAIH, you agree to our terms and conditions regarding service usage, community guidelines, and content policies. Our platform is designed to foster respectful cultural exchanges.
            </p>
          </>
        );
      case "privacy":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
            <p className="text-gray-600">
              We respect your privacy and are committed to protecting your personal data. We never sell your information to third parties and only collect data necessary for providing our services.
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <footer className="bg-gray-900 text-white">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold">RAIH</span>
              </Link>
              <p className="text-gray-400 text-sm mb-4">
                Connect. Travel. Experience. Make a difference around the world.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <ul className="space-y-3">
                {footerLinks.explore.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Hosting</h3>
              <ul className="space-y-3">
                {footerLinks.host.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    {link.action ? (
                      <button onClick={link.action} className="text-gray-400 hover:text-white text-sm transition-colors">
                        {link.label}
                      </button>
                    ) : (
                      <Link to={link.href!} className="text-gray-400 hover:text-white text-sm transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    {link.action ? (
                      <button onClick={link.action} className="text-gray-400 hover:text-white text-sm transition-colors">
                        {link.label}
                      </button>
                    ) : (
                      <Link to={link.href!} className="text-gray-400 hover:text-white text-sm transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} RAIH. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <button onClick={() => setOpenModal("privacy")} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
                <span>•</span>
                <button onClick={() => setOpenModal("terms")} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
                <span>•</span>
                <button className="flex items-center gap-1 hover:text-white transition-colors">
                  <Globe className="w-4 h-4" />
                  English (US)
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <Dialog open={!!openModal} onClose={closeModal} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-8 z-50 animate-scale-in">
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            {renderModalContent()}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default FooterSection;
