"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { TenantHeader } from "@/components/tenant-header"
import { TenantSidebar } from "@/components/tenant-sidebar"
import { Upload, X } from "lucide-react"

export default function NewTicket() {
  const router = useRouter()
  const [showSidebar, setShowSidebar] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, we would submit the form data to the server
    // For demo purposes, we'll just redirect to the tickets page
    router.push("/tenant/tickets")
  }

  const simulateImageUpload = () => {
    setUploading(true)
    // Simulate upload delay
    setTimeout(() => {
      setImages([...images, `/placeholder.svg?height=200&width=200&text=Image+${images.length + 1}`])
      setUploading(false)
    }, 1500)
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TenantHeader onMenuClick={() => setShowSidebar(!showSidebar)} />

      <div className="flex flex-1">
        <TenantSidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Create Maintenance Ticket</h1>
            <p className="text-muted-foreground">Submit a new maintenance request for your apartment.</p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Maintenance Request</CardTitle>
                <CardDescription>Please provide details about the issue you're experiencing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="hvac">HVAC / Air Conditioning</SelectItem>
                      <SelectItem value="appliance">Appliance</SelectItem>
                      <SelectItem value="structural">Structural</SelectItem>
                      <SelectItem value="pest">Pest Control</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Brief description of the issue" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about the issue"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Urgency Level</Label>
                  <RadioGroup defaultValue="normal" className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="emergency" id="emergency" />
                      <Label htmlFor="emergency" className="font-normal">
                        Emergency - Requires immediate attention (water flooding, no electricity, etc.)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="urgent" id="urgent" />
                      <Label htmlFor="urgent" className="font-normal">
                        Urgent - Should be addressed within 24 hours
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="normal" />
                      <Label htmlFor="normal" className="font-normal">
                        Normal - Can be addressed within a few days
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low" className="font-normal">
                        Low - Not time-sensitive
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Photos</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative rounded-md overflow-hidden border">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Uploaded image ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="h-32 border-dashed flex flex-col items-center justify-center gap-1"
                      onClick={simulateImageUpload}
                      disabled={uploading}
                    >
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">{uploading ? "Uploading..." : "Add Photo"}</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add photos to help us better understand the issue. Maximum 5 photos.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="access">Access Instructions</Label>
                  <Textarea
                    id="access"
                    placeholder="Any special instructions for accessing your unit? (Optional)"
                    rows={2}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit">Submit Ticket</Button>
              </CardFooter>
            </form>
          </Card>
        </main>
      </div>
    </div>
  )
}
