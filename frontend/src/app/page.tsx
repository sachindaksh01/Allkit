'use client';

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Image, FileText, Music, Video, FileCode, Globe, Lock, QrCode, Calculator, Database, Type, Settings, Star, ShieldCheck, Zap, Users, Rocket, Calendar, Clock, Scale, Flame, Baby, Banknote, Percent, Ruler, Shapes, LucideIcon, FileSpreadsheet, Presentation, FileImage, FileArchive, FileStack, ImageIcon, Eraser, Maximize2, Crop, RotateCw, FileUp, FileDown, MinusCircle } from "lucide-react"

const categories = [
  { name: "Image Tools", icon: Image, href: "/tools/image-tools", count: 40 },
  { name: "PDF Tools", icon: FileText, href: "/tools/pdf-tools", count: 20 },
  { name: "Video Processing Tools", icon: Video, href: "/tools/video-processing-tools", count: 40 },
  { name: "Audio Processing Tools", icon: Music, href: "/tools/audio-processing-tools", count: 30 },
  { name: "Document Convert", icon: FileText, href: "/tools/document-convert", count: 50 },
  { name: "Text & String Tools", icon: Type, href: "/tools/text-and-string-tools", count: 40 },
  { name: "Data Converters", icon: Database, href: "/tools/data-converters", count: 30 },
  { name: "Code & Dev Tools", icon: FileCode, href: "/tools/code-and-dev-tools", count: 50 },
  { name: "Network & Web Tools", icon: Globe, href: "/tools/network-and-web-tools", count: 40 },
  { name: "Security & Crypto Tools", icon: Lock, href: "/tools/security-and-crypto-tools", count: 30 },
  { name: "QR & Barcode Tools", icon: QrCode, href: "/tools/qr-and-barcode-tools", count: 20 },
  { name: "Calculators & Converters", icon: Calculator, href: "/tools/calculators-and-converters", count: 30 },
];

interface Tool {
  title: string;
  description: string;
  href: string;
  status: string;
  icon?: LucideIcon;
}

interface ToolCategory {
  title: string;
  description: string;
  items: Tool[];
}

const tools: Record<string, ToolCategory> = {
  pdf: {
    title: 'PDF Tools',
    description: 'Convert, compress, merge, split and organize your PDF files',
    items: [
      {
        title: 'PDF to Excel',
        description: 'Convert PDF files to Excel format',
        href: '/tools/pdf/convert/to-excel',
        status: 'completed',
        icon: FileSpreadsheet
      },
      {
        title: 'PDF to Word',
        description: 'Convert PDF files to Word format',
        href: '/tools/pdf/convert/to-word',
        status: 'completed',
        icon: FileText
      },
      {
        title: 'PDF to PowerPoint',
        description: 'Convert PDF files to PowerPoint format',
        href: '/tools/pdf/convert/to-powerpoint',
        status: 'development',
        icon: Presentation
      },
      {
        title: 'PDF to Images',
        description: 'Convert PDF files to image format',
        href: '/tools/pdf/convert/to-images',
        status: 'development',
        icon: FileImage
      },
      {
        title: 'Image to PDF',
        description: 'Convert images to PDF format',
        href: '/tools/pdf/from/image',
        status: 'development',
        icon: FileImage
      },
      {
        title: 'Word to PDF',
        description: 'Convert Word files to PDF format',
        href: '/tools/pdf/from/word',
        status: 'development',
        icon: FileText
      },
      {
        title: 'Excel to PDF',
        description: 'Convert Excel files to PDF format',
        href: '/tools/pdf/from/excel',
        status: 'development',
        icon: FileSpreadsheet
      },
      {
        title: 'PowerPoint to PDF',
        description: 'Convert PowerPoint files to PDF format',
        href: '/tools/pdf/from/powerpoint',
        status: 'development',
        icon: Presentation
      },
      {
        title: 'Compress PDF',
        description: 'Reduce PDF file size while maintaining quality',
        href: '/tools/pdf/compress',
        status: 'completed',
        icon: FileArchive
      },
      {
        title: 'Merge PDF',
        description: 'Combine multiple PDF files into one',
        href: '/tools/pdf/merge',
        status: 'completed',
        icon: FileUp
      },
      {
        title: 'Split PDF',
        description: 'Split PDF files into multiple documents',
        href: '/tools/pdf/split',
        status: 'completed',
        icon: FileDown
      },
      {
        title: 'Organize PDF',
        description: 'Organize and arrange PDF pages',
        href: '/tools/pdf/organize',
        status: 'completed',
        icon: FileStack
      }
    ]
  },
  image: {
    title: 'Image Tools',
    description: 'Convert, compress, resize and edit your images',
    items: [
      {
        title: 'Image Converter',
        description: 'Convert images between different formats',
        href: '/tools/image/convert',
        status: 'completed',
        icon: ImageIcon
      },
      {
        title: 'Background Remover',
        description: 'Remove background from images',
        href: '/bgremover',
        status: 'completed',
        icon: Eraser
      },
      {
        title: 'Image Compressor/Resize',
        description: 'Compress or resize images without losing quality',
        href: '/tools/image/compressor-resize',
        status: 'development',
        icon: MinusCircle
      },
      {
        title: "Image Crop & Rotate",
        description: "Crop and rotate your images with precision. Perfect for social media, websites, and more.",
        icon: Crop,
        href: "/tools/image/crop-rotate",
        status: 'development'
      }
    ]
  },
  calculator: {
    title: 'Calculator Tools',
    description: 'Various calculators for different purposes',
    items: [
      {
        title: 'Age Calculator',
        description: 'Calculate age between two dates',
        href: '/tools/calculator/data/age',
        status: 'development',
        icon: Calendar
      },
      {
        title: 'Date Calculator',
        description: 'Calculate date differences and add/subtract dates',
        href: '/tools/calculator/data/date',
        status: 'development',
        icon: Calendar
      },
      {
        title: 'Time Calculator',
        description: 'Calculate time differences and add/subtract time',
        href: '/tools/calculator/data/time',
        status: 'development',
        icon: Clock
      },
      {
        title: 'BMI Calculator',
        description: 'Calculate Body Mass Index',
        href: '/tools/calculator/health/bmi',
        status: 'development',
        icon: Scale
      },
      {
        title: 'Calorie Calculator',
        description: 'Calculate daily calorie needs',
        href: '/tools/calculator/health/calorie',
        status: 'development',
        icon: Flame
      },
      {
        title: 'Pregnancy Calculator',
        description: 'Calculate pregnancy due date and milestones',
        href: '/tools/calculator/health/pregnancy',
        status: 'development',
        icon: Baby
      },
      {
        title: 'Loan Calculator',
        description: 'Calculate loan payments and interest',
        href: '/tools/calculator/finance/loan',
        status: 'development',
        icon: Banknote
      },
      {
        title: 'Interest Calculator',
        description: 'Calculate simple and compound interest',
        href: '/tools/calculator/finance/interest',
        status: 'development',
        icon: Percent
      },
      {
        title: 'Currency Converter',
        description: 'Convert between different currencies',
        href: '/tools/calculator/finance/currency',
        status: 'development',
        icon: Banknote
      },
      {
        title: 'Percentage Calculator',
        description: 'Calculate percentages and percentage changes',
        href: '/tools/calculator/math/percentage',
        status: 'development',
        icon: Percent
      },
      {
        title: 'Unit Converter',
        description: 'Convert between different units of measurement',
        href: '/tools/calculator/math/unit',
        status: 'development',
        icon: Ruler
      },
      {
        title: 'Geometry Calculator',
        description: 'Calculate area, perimeter, and volume',
        href: '/tools/calculator/math/geometry',
        status: 'development',
        icon: Shapes
      }
    ]
  }
};

export default function Home() {
  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">AllKit: Tools in Your Pocket</h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          The world's best free online toolkit for images, PDFs, documents, code, and more. Trusted by millions of users worldwide. No sign-up, no hassle—just powerful tools at your fingertips.
        </p>
      </div>

      {/* AllKit.io - Your All-in-One Toolkit Section (moved up) */}
      <div className="mt-10">
        {Object.entries(tools).map(([key, category]) => (
          <div key={key} className="mb-12">
            <h3 className="text-2xl font-semibold mb-2 text-center">{category.title}</h3>
            <p className="text-gray-600 mb-6 text-center">{category.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.items.map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow p-3 md:p-4 text-sm flex items-center gap-3">
                    <span
                      className={
                        "flex-shrink-0 rounded-full p-2 " +
                        (key === 'pdf' ? 'bg-red-100 dark:bg-red-900' : key === 'image' ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900')
                      }
                    >
                      {tool.icon && (
                        <tool.icon
                          className="h-6 w-6 text-white"
                        />
                      )}
                    </span>
                    <div className="flex-1 flex flex-col items-center text-center">
                      <h4 className="text-base font-medium mb-1">{tool.title}</h4>
                      <p className="text-gray-600 text-xs">{tool.description}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Why AllKit Section */}
      <div className="mt-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Why AllKit?</h2>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
          AllKit is the world's best one-stop solution for all your digital needs. Whether you're a student, professional, or developer, our platform offers a seamless experience with blazing fast performance, privacy-first processing, and a growing suite of tools—all in one place.
        </p>
        <div className="grid gap-8 md:grid-cols-4">
          <div className="flex flex-col items-center">
            <Star className="h-10 w-10 text-yellow-400 mb-2" />
            <h3 className="font-semibold text-lg">Top Rated</h3>
            <p className="text-sm text-muted-foreground">Loved by thousands of users worldwide for reliability and ease of use.</p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="h-10 w-10 text-green-500 mb-2" />
            <h3 className="font-semibold text-lg">Privacy First</h3>
            <p className="text-sm text-muted-foreground">Your files are processed locally and deleted automatically for maximum privacy.</p>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="h-10 w-10 text-blue-500 mb-2" />
            <h3 className="font-semibold text-lg">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">Instant results with no waiting—get your work done in seconds.</p>
          </div>
          <div className="flex flex-col items-center">
            <Rocket className="h-10 w-10 text-purple-500 mb-2" />
            <h3 className="font-semibold text-lg">All-in-One</h3>
            <p className="text-sm text-muted-foreground">From PDFs to images to code, everything you need is here—no switching sites.</p>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-accent/50 rounded-xl p-6 flex flex-col items-center text-center">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <h4 className="font-semibold text-lg mb-1">User Friendly</h4>
            <p className="text-sm text-muted-foreground">Simple, intuitive interfaces for everyone—no tech skills required.</p>
          </div>
          <div className="bg-accent/50 rounded-xl p-6 flex flex-col items-center text-center">
            <FileText className="h-8 w-8 text-green-500 mb-2" />
            <h4 className="font-semibold text-lg mb-1">No Watermarks</h4>
            <p className="text-sm text-muted-foreground">All outputs are clean—no branding, no watermarks, ever.</p>
          </div>
          <div className="bg-accent/50 rounded-xl p-6 flex flex-col items-center text-center">
            <Settings className="h-8 w-8 text-purple-500 mb-2" />
            <h4 className="font-semibold text-lg mb-1">Customizable</h4>
            <p className="text-sm text-muted-foreground">Advanced options for power users and professionals.</p>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="mt-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Trusted by Professionals</h2>
        <p className="text-muted-foreground mb-6">Used by students, teachers, designers, developers, and businesses worldwide.</p>
        <div className="flex flex-wrap justify-center gap-8 opacity-70">
          <div className="bg-white/10 rounded-lg px-8 py-4 text-lg font-bold">EduPro</div>
          <div className="bg-white/10 rounded-lg px-8 py-4 text-lg font-bold">DesignHub</div>
          <div className="bg-white/10 rounded-lg px-8 py-4 text-lg font-bold">DevWorks</div>
          <div className="bg-white/10 rounded-lg px-8 py-4 text-lg font-bold">BizSuite</div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <span className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-2">1</span>
            <h4 className="font-semibold text-lg mb-1">Choose a Tool</h4>
            <p className="text-sm text-muted-foreground">Pick from dozens of categories and tools for your task.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-2">2</span>
            <h4 className="font-semibold text-lg mb-1">Upload or Enter Data</h4>
            <p className="text-sm text-muted-foreground">Drag & drop files or enter your data—no sign-up needed.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-2">3</span>
            <h4 className="font-semibold text-lg mb-1">Get Instant Results</h4>
            <p className="text-sm text-muted-foreground">Download, copy, or share your results instantly and securely.</p>
          </div>
        </div>
      </div>

      {/* Get Started CTA Section */}
      <div className="mt-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg text-muted-foreground mb-6">Experience the power of AllKit—your all-in-one toolkit for every workflow.</p>
        <Link href="/tools/pdf-tools">
          <button className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition">Start Using AllKit Now</button>
        </Link>
      </div>

      <footer className="w-full py-8 border-t mt-20 text-center text-sm text-gray-500 dark:text-gray-400">
        {/* Footer links removed as per request */}
      </footer>
    </div>
  )
}

