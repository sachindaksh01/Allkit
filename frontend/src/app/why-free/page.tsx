import { Card, CardContent } from "@/components/ui/card"
import { Shield, Zap, Lock, Users } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Privacy First",
    description: "No sign-in required. We process your data locally or in our secure cloud, and auto-delete all files every 30 minutes.",
    emoji: "🔒"
  },
  {
    icon: Zap,
    title: "Instant Access",
    description: "Every tool is free and unlimited. No hidden fees, no data hoarding—just the tools you need, when you need them.",
    emoji: "⚡"
  },
  {
    icon: Lock,
    title: "No Paywalls",
    description: "Unlike other platforms that hit you with paywalls or force subscriptions after a few uses, AllKit remains completely free.",
    emoji: "🚫"
  },
  {
    icon: Users,
    title: "User-Focused",
    description: "Built to break the cycle of frustrating limitations. We believe in providing accessible tools without compromising on quality.",
    emoji: "👥"
  }
]

export default function WhyFreePage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Why AllKit is Free</h1>
          <p className="text-xl text-muted-foreground">
            Breaking the cycle of limited tools and hidden fees
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg">
            In today's market, you'll find dozens of sites offering individual utilities—but none that truly do it all. Most platforms let you use a tool a few times, then hit you with paywalls or force you into a subscription. That frustrates users. On top of that, many require you to sign in (raising privacy concerns) or quietly store your files indefinitely.
          </p>
          <p className="text-lg">
            We built AllKit to break that cycle. Every tool you see here is free and unlimited, with no sign-in required. We process your data locally in your browser or on our secure cloud, and auto-delete all files every 30 minutes. No hidden fees, no data hoarding—just the tools you need, when you need them.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {feature.title}
                      <span>{feature.emoji}</span>
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Pro Tip 💡</h3>
            <p className="text-muted-foreground">
              While our web tools are completely free, we also offer API access for developers and businesses who need to integrate our tools into their applications. Check out our API documentation for more details.
            </p>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Our Commitment</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We believe powerful tools should be accessible to everyone. That's why we're committed to keeping AllKit free while maintaining the highest quality standards. Your trust and satisfaction are our top priorities.
          </p>
        </div>
      </div>
    </div>
  )
} 