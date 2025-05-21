import { Metadata } from "next"
import { BackgroundRemover } from "@/components/background-remover"

export const metadata: Metadata = {
  title: "Background Remover - AllKit",
  description: "Remove backgrounds from images automatically",
}

export default function BackgroundRemoverPage() {
  return (
    <main className="container mx-auto py-10">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl font-bold">Background Remover</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Remove backgrounds from your images with just a few clicks. Perfect for product photos and portraits.
        </p>
        <BackgroundRemover />
      </div>
    </main>
  )
} 