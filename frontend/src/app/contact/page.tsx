import React from "react";
import { Mail, MessageCircle, Users, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container py-8 prose dark:prose-invert">
      <h1 className="flex items-center gap-2 text-4xl font-bold mb-6"><Mail className="inline-block text-blue-500" size={36}/> Contact Us</h1>
      <p className="text-lg mb-6">We'd love to hear from you! Whether you have a question, feedback, partnership inquiry, or need support, the AllKit team is here to help.</p>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><MessageCircle className="inline-block text-green-500" size={28}/> How to Reach Us</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Email:</strong> <a href="mailto:support@allkit.app" className="text-blue-600 underline">support@allkit.app</a></li>
        <li><strong>Feedback & Suggestions:</strong> We welcome your ideas to make AllKit better!</li>
        <li><strong>Partnerships & Sponsorships:</strong> Interested in collaborating or featuring your tool? Get in touch!</li>
      </ul>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><Clock className="inline-block text-yellow-500" size={28}/> Response Time</h2>
      <p>We aim to respond to all inquiries within 1-2 business days.</p>
      <p className="mt-8 text-xl font-semibold text-center"><Users className="inline-block text-blue-500 mr-2" size={24}/> Thank you for being a part of the AllKit community!</p>
    </div>
  );
} 