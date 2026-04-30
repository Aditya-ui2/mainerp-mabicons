import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white text-[#333] font-sans pb-20">
      {/* Header / Nav */}
      <div className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-[850px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-2 text-[#3D37F1] text-[13px] font-medium hover:underline">
            <FiChevronLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>

      <div className="max-w-[850px] mx-auto px-6 pt-16">
        <h1 className="text-3xl font-bold text-[#111] mb-6">Privacy Policy</h1>
        
        <div className="space-y-12 text-[15px] leading-relaxed text-gray-700 text-left">
          <section>
            <h2 className="text-xl font-bold text-[#111] mb-4">1. Introduction</h2>
            <p>
              Welcome to Mabicons Enterprises Ltd. ("Company," "we," "us," or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or use our ERP platform and related services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <p>
                <strong>Personal Information:</strong> We collect personal information that you voluntarily provide to us when you register on the platform, including but not limited to your name, email address, phone number, professional background, and organization details.
              </p>
              <p>
                <strong>Usage Data:</strong> When you access our services, we may collect information about your device and how you interact with our platform. This includes IP addresses, browser types, access times, pages viewed, and the routes you take within the application.
              </p>
              <p>
                <strong>Candidate Data:</strong> As a recruitment-focused ERP, we process resumes, identification documents, and interview feedback provided by candidates or recruiters for the purpose of talent acquisition.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. Specifically:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>To provide, operate, and maintain our ERP platform.</li>
              <li>To improve, personalize, and expand our services and user experience.</li>
              <li>To understand and analyze how you use our platform for performance optimization.</li>
              <li>To facilitate recruitment, onboarding, and payroll management for our clients.</li>
              <li>To communicate with you, including for customer service, updates, and security alerts.</li>
              <li>To detect and prevent fraudulent activities and ensure system integrity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-4">4. Data Retention and Security</h2>
            <p className="mb-4">
              We keep your personal information only for as long as it is necessary for the purposes set out in this privacy policy, or as required by law (such as tax, accounting, or other legal requirements).
            </p>
            <p>
              We have implemented appropriate technical and organizational security measures, including encryption and secure cloud storage, designed to protect the security of any personal information we process. However, despite our safeguards, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-4">5. Cookies and Tracking Technologies</h2>
            <p>
              We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. These are used to enhance navigation, analyze site usage, and assist in our marketing efforts. You can choose to disable cookies through your individual browser options.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-4">6. Sharing of Information</h2>
            <p className="mb-4">We may share information in specific situations and with specific third parties:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Service Providers:</strong> We may share your data with third-party vendors who perform services for us or on our behalf.</li>
              <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with any merger, sale of company assets, or acquisition.</li>
              <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law or governmental requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-4">7. Your Privacy Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data. To exercise these rights, please contact us using the details provided below. We will respond to your request in accordance with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-4">8. Updates to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy policy frequently to stay informed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-4">9. Contact Us</h2>
            <p>
              If you have questions or comments about this policy, you may email us at <strong>privacy@mabicons.com</strong> or by post to:
            </p>
            <div className="mt-4 font-medium text-gray-800 bg-gray-50 p-6 rounded-2xl inline-block border border-gray-100">
              Mabicons Technosoft Pvt. Ltd.<br />
              Digital HR Solutions<br />
              India
            </div>
          </section>
        </div>

        {/* Simple Footer */}
        <div className="mt-20 pt-10 border-t border-gray-100 text-center">
          <p className="text-[13px] text-gray-400 font-medium tracking-tight">
            © 2026 Mabicons Technosoft Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
