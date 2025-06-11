import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export default function NewsletterPage() {
  return (
    <div className="px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-davinci-black-alt mb-4 font-averia">Newsletter</h1>
          <p className="text-lg text-davinci-black-alt/80 max-w-2xl mx-auto">
            Stay updated with the latest news and developments from the DAVINCI project.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="border-davinci-callout-border">
            <CardHeader className="bg-davinci-paper-base">
              <CardTitle className="flex items-center gap-2 text-davinci-black-alt">
                <Mail className="w-5 h-5" />
                Subscribe to Our Newsletter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 bg-davinci-text-base">
              <p className="text-davinci-black-alt/80">
                Get the latest updates, announcements, and technical insights delivered directly to your inbox.
              </p>

              <form className="space-y-4">
                <div>
                  <Input type="email" placeholder="Email Address" className="border-davinci-callout-border" required />
                </div>
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base"
                  >
                    Subscribe
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
