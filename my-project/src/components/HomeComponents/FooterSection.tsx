import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faTwitter,
  faLinkedin,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

const FooterSection = () => {
  const [openModal, setOpenModal] = useState<null | "about" | "contact" | "terms" | "privacy">(null);

  const closeModal = () => setOpenModal(null);

  const renderModalContent = () => {
    switch (openModal) {
      case "about":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">About Us</h2>
            <p className="text-gray-700">
              RAIH is a platform focused on connecting travelers and hosts across the globe through meaningful experiences.
            </p>
          </>
        );
      case "contact":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-700">
              You can reach us at <a href="mailto:support@raih.com" className="text-blue-600">support@raih.com</a>
            </p>
          </>
        );
      case "terms":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Terms of Service</h2>
            <p className="text-gray-700">
              By using our platform, you agree to our terms and conditions regarding service, content, and community behavior.
            </p>
          </>
        );
      case "privacy":
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Privacy Policy</h2>
            <p className="text-gray-700">
              We respect your privacy and protect your data. We never sell your personal info.
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <footer className="border-t border-gray-200 py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4">
              <span className="text-xl font-bold">RAIH</span>
            </div>
            <nav className="mb-4">
              <ul className="flex space-x-6 text-gray-600">
                <li>
                  <button onClick={() => setOpenModal("about")} className="hover:text-black">About Us</button>
                </li>
                <li>
                  <button onClick={() => setOpenModal("contact")} className="hover:text-black">Contact Us</button>
                </li>
                <li>
                  <button onClick={() => setOpenModal("terms")} className="hover:text-black">Terms</button>
                </li>
                <li>
                  <button onClick={() => setOpenModal("privacy")} className="hover:text-black">Privacy</button>
                </li>
              </ul>
            </nav>
            <div className="flex space-x-4 mb-4">
  {[
    { icon: faFacebook, url: "https://facebook.com/yourpage" },
    { icon: faInstagram, url: "https://instagram.com/yourpage" },
    { icon: faTwitter, url: "https://twitter.com/yourpage" },
    { icon: faLinkedin, url: "https://linkedin.com/in/yourpage" },
    { icon: faYoutube, url: "https://youtube.com/yourchannel" },
  ].map((item, idx) => (
    <a
      key={idx}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-primary-600 transition-transform hover:scale-110"
    >
      <FontAwesomeIcon icon={item.icon} className="h-6 w-6" />
    </a>
  ))}
</div>

          </div>
          <div className="mt-8 text-center text-sm text-gray-500 flex justify-center space-x-4">
            <span>© Raih. All rights reserved.</span>
            <button onClick={() => setOpenModal("privacy")} className="hover:text-black">Privacy Policy</button>
            <button onClick={() => setOpenModal("terms")} className="hover:text-black">Terms of Service</button>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <Dialog open={!!openModal} onClose={closeModal} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          {/* Custom Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={closeModal} />

          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-50">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
              <X size={20} />
            </button>
            {renderModalContent()}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default FooterSection;
