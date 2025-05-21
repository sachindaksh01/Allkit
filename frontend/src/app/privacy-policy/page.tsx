import React from "react";
import { Shield, Info, UserCheck, RefreshCcw, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-8 prose dark:prose-invert">
      <h1 className="flex items-center gap-2 text-4xl font-bold mb-6"><Shield className="inline-block text-blue-500" size={36}/> Privacy Policy</h1>
      <p className="mb-6"><em>Last updated: June 2024</em></p>
      <p>At <strong>AllKit</strong>, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our website and tools.</p>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><Info className="inline-block text-purple-500" size={28}/> What We Collect</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Basic Usage Data:</strong> We may collect anonymous usage statistics to improve our services.</li>
        <li><strong>Personal Information:</strong> Only if you contact us or sign up for premium features (e.g., email address).</li>
        <li><strong>Cookies:</strong> We use cookies to enhance your experience and remember your preferences. You can disable cookies in your browser settings.</li>
      </ul>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><UserCheck className="inline-block text-green-500" size={28}/> How We Use Your Data</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To provide and improve our tools and services</li>
        <li>To communicate with you (if you contact us)</li>
        <li>To offer relevant affiliate deals or sponsored content (non-intrusive)</li>
      </ul>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><Info className="inline-block text-orange-500" size={28}/> Third-Party Services</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>We may use third-party analytics and affiliate partners. These services have their own privacy policies.</li>
        <li>We do <strong>not</strong> sell your personal data to anyone.</li>
      </ul>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><UserCheck className="inline-block text-blue-400" size={28}/> Your Rights</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>You can request to view, update, or delete your personal data by contacting us.</li>
        <li>You can opt out of cookies and analytics at any time.</li>
      </ul>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><RefreshCcw className="inline-block text-pink-500" size={28}/> Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. Changes will be posted on this page.</p>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><Mail className="inline-block text-blue-500" size={28}/> Contact Us</h2>
      <p>If you have any questions about this policy, please <a href="/contact" className="text-blue-600 underline">contact us</a>.</p>
      <p className="mt-8 text-xl font-semibold text-center"><Shield className="inline-block text-blue-500 mr-2" size={24}/> AllKit – Your privacy, our priority.</p>
    </div>
  );
} 