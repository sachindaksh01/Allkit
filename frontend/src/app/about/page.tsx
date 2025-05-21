import React from "react";
import { Users, Star, Globe, HeartHandshake, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container py-8 prose dark:prose-invert">
      <h1 className="flex items-center gap-2 text-4xl font-bold mb-6"><Users className="inline-block text-blue-500" size={36}/> About Us</h1>
      <p className="text-lg mb-6"><strong>AllKit</strong> – your all-in-one toolkit for productivity, creativity, and digital empowerment!</p>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><Star className="inline-block text-yellow-500" size={28}/> Our Mission</h2>
      <p>AllKit is on a mission to make powerful digital tools accessible to everyone, for free or at a fair price. Whether you're a student, professional, business, or creator, our platform brings together the best PDF, media, development, and utility tools in one modern, easy-to-use web app.</p>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><HeartHandshake className="inline-block text-pink-500" size={28}/> What Makes Us Different?</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Truly Free Tools:</strong> Unlimited usage for most features on the web UI. No hidden paywalls for basic needs.</li>
        <li><strong>Smart Monetization:</strong> We offer premium API tiers, sponsored tools, and affiliate deals – but always keep the user experience clean and non-intrusive.</li>
        <li><strong>Community-Driven:</strong> We welcome tool creators, plugin developers, and educators to contribute, sponsor, or build on our platform.</li>
        <li><strong>Transparency:</strong> Clear labels for sponsored content, privacy-first design, and open communication with our users.</li>
      </ul>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><Globe className="inline-block text-green-500" size={28}/> Our Vision</h2>
      <p>We believe in a world where everyone can access the digital tools they need, without barriers. From students merging PDFs to businesses automating workflows, AllKit is here to help you get more done, faster.</p>
      <h2 className="flex items-center gap-2 text-2xl mt-8 mb-2"><ArrowRight className="inline-block text-blue-400" size={28}/> Join Us</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Try our tools, share your feedback, and help us grow!</li>
        <li>Interested in partnerships, sponsorships, or white-label solutions? <a href="/contact" className="text-blue-600 underline">Contact us</a>.</li>
      </ul>
      <p className="mt-8 text-xl font-semibold text-center"><Star className="inline-block text-yellow-500 mr-2" size={24}/> AllKit – Tools for Everyone, Everywhere.</p>
    </div>
  );
} 