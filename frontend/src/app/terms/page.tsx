import React from "react";
import { FileText, CheckCircle, Copyright, AlertTriangle, RefreshCcw, Mail } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="container py-8 prose dark:prose-invert">
      <h1 className="flex items-center gap-2 text-4xl font-bold mb-6"><FileText className="inline-block text-blue-500" size={36}/> Terms and Conditions</h1>
      <p className="mb-6"><em>Last updated: June 2024</em></p>
      <p>Welcome to <strong>AllKit</strong>! By using our website and tools, you agree to the following terms and conditions. Please read them carefully.</p>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><CheckCircle className="inline-block text-green-500" size={28}/> 1. Use of Our Services</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>You may use AllKit tools for personal or business purposes, as long as you comply with these terms.</li>
        <li>Do not use our services for illegal, harmful, or abusive activities.</li>
      </ul>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><Copyright className="inline-block text-yellow-500" size={28}/> 2. Intellectual Property</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>AllKit and its tools, content, and branding are the property of AllKit or its partners.</li>
        <li>You may not copy, resell, or redistribute our tools without permission.</li>
      </ul>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><FileText className="inline-block text-blue-400" size={28}/> 3. User Content</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>You are responsible for any files or data you upload or process using our tools.</li>
        <li>Do not upload content that is illegal, offensive, or infringes on others' rights.</li>
      </ul>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><AlertTriangle className="inline-block text-red-500" size={28}/> 4. Disclaimers</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>AllKit tools are provided "as is" without warranties of any kind.</li>
        <li>We strive for accuracy and reliability, but we do not guarantee error-free operation or uninterrupted service.</li>
        <li>We are not liable for any damages resulting from the use or inability to use our services.</li>
      </ul>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><RefreshCcw className="inline-block text-pink-500" size={28}/> 5. Changes to These Terms</h2>
      <p>We may update these terms from time to time. Changes will be posted on this page. Continued use of AllKit means you accept the updated terms.</p>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><Mail className="inline-block text-blue-500" size={28}/> 6. Contact Us</h2>
      <p>If you have any questions about these terms, please <a href="/contact" className="text-blue-600 underline">contact us</a>.</p>
      <p className="mt-8 text-xl font-semibold text-center"><FileText className="inline-block text-blue-500 mr-2" size={24}/> Thank you for using AllKit!</p>
    </div>
  );
} 