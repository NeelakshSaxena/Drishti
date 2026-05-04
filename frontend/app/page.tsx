"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import * as api from "@/lib/api"
import toast, { Toaster } from "react-hot-toast"

export default function Home() {
  const [step, setStep] = useState<"role" | "child" | "parent">("role")
  const [childId, setChildId] = useState<string | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)

  const handleStartAsChild = async () => {
    try {
      const result = await api.initChild()
      setChildId(result.child_id)
      localStorage.setItem("childId", result.child_id)
      localStorage.setItem("childCode", result.child_code)
      setStep("child")
      toast.success("Child account created!")
    } catch (error) {
      toast.error("Failed to create child account")
    }
  }

  const handleStartAsParent = async () => {
    try {
      const result = await api.initParent()
      setParentId(result.parent_id)
      localStorage.setItem("parentId", result.parent_id)
      setStep("parent")
      toast.success("Parent account created!")
    } catch (error) {
      toast.error("Failed to create parent account")
    }
  }

  if (step === "role") {
    return (
      <>
        <Toaster />
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
          <Card className="w-full max-w-md border-slate-800">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Drishti</CardTitle>
              <CardDescription>Family Trip Tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleStartAsParent} className="w-full" variant="default" size="lg">
                Login as Parent
              </Button>
              <Button onClick={handleStartAsChild} className="w-full" variant="secondary" size="lg">
                Login as Child
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (step === "child" && childId) {
    return <ChildDashboard childId={childId} />
  }

  if (step === "parent" && parentId) {
    return <ParentDashboard parentId={parentId} />
  }

  return null
}

function ChildDashboard({ childId }: { childId: string }) {
  const [childCode, setChildCode] = useState<string | null>(null)
  const [parentLinked, setParentLinked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasActiveTrip, setHasActiveTrip] = useState(false)
  const [tripEvents, setTripEvents] = useState<api.TripEvent[]>([])
  const [eventType, setEventType] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [time, setTime] = useState("")

  useEffect(() => {
    const code = localStorage.getItem("childCode")
    setChildCode(code)
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await api.getChildDashboard(childId)
      setParentLinked(!!data.child.parent_id)
      setHasActiveTrip(!!data.current_trip)
      if (data.current_trip) {
        setTripEvents(data.current_trip.events)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTrip = async () => {
    try {
      await api.startTrip(childId)
      setHasActiveTrip(true)
      setTripEvents([])
      toast.success("Trip started!")
    } catch (error) {
      toast.error("Failed to start trip")
    }
  }

  const handleEndTrip = async () => {
    try {
      await api.endTrip(childId)
      setHasActiveTrip(false)
      setTripEvents([])
      toast.success("Trip ended!")
    } catch (error) {
      toast.error("Failed to end trip")
    }
  }

  const handleAddEvent = async () => {
    if (!eventType || !from || !to) {
      toast.error("Please fill in all event details")
      return
    }

    try {
      await api.addEventToTrip(childId, {
        type: eventType,
        from_location: from,
        to_location: to,
        time,
        description: "",
      })
      setEventType("")
      setFrom("")
      setTo("")
      setTime("")
      await loadDashboard()
      toast.success("Event added!")
    } catch (error) {
      toast.error("Failed to add event")
    }
  }

  const copyCode = () => {
    if (childCode) {
      navigator.clipboard.writeText(childCode)
      toast.success("Code copied!")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {!parentLinked && (
            <Card className="border-yellow-900 bg-slate-900">
              <CardHeader>
                <CardTitle>Share Your Code with Parent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded bg-slate-800 p-4">
                  <code className="text-lg font-mono text-slate-50">{childCode}</code>
                  <Button onClick={copyCode} variant="secondary" size="sm">
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {parentLinked && (
            <Card>
              <CardHeader>
                <CardTitle>Trip Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasActiveTrip ? (
                  <Button onClick={handleStartTrip} className="w-full">
                    Start Trip
                  </Button>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          className="rounded border border-slate-800 bg-slate-950 px-3 py-2 text-slate-50"
                        >
                          <option value="">Select Event Type</option>
                          <option value="flight">Flight</option>
                          <option value="train">Train</option>
                          <option value="bus">Bus</option>
                          <option value="hostel">Hostel</option>
                          <option value="custom">Custom</option>
                        </select>
                        <Input placeholder="From Location" value={from} onChange={(e) => setFrom(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input placeholder="To Location" value={to} onChange={(e) => setTo(e.target.value)} />
                        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                      </div>
                      <Button onClick={handleAddEvent} className="w-full">
                        Add Event
                      </Button>
                    </div>

                    {tripEvents.length > 0 && (
                      <div className="mt-6 space-y-3 border-t border-slate-800 pt-4">
                        <h3 className="font-semibold text-slate-50">Trip Timeline</h3>
                        {tripEvents.map((event) => (
                          <div key={event.id} className="rounded bg-slate-800 p-3 text-sm">
                            <p className="font-medium text-slate-50">{event.type.toUpperCase()}</p>
                            <p className="text-slate-400">
                              {event.from_location} → {event.to_location}
                            </p>
                            {event.time && <p className="text-xs text-slate-500">{event.time}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    <Button onClick={handleEndTrip} variant="destructive" className="w-full">
                      End Trip
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

function ParentDashboard({ parentId }: { parentId: string }) {
  const [childCode, setChildCode] = useState("")
  const [linkedChildren, setLinkedChildren] = useState<api.Child[]>([])
  const [loading, setLoading] = useState(false)

  const loadDashboard = async () => {
    try {
      const data = await api.getParentDashboard(parentId)
      setLinkedChildren(data.linked_children)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleLinkChild = async () => {
    if (!childCode.trim()) {
      toast.error("Please enter a child code")
      return
    }

    try {
      await api.linkChild(parentId, childCode.toUpperCase())
      setChildCode("")
      await loadDashboard()
      toast.success("Child linked successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to link child")
    }
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Link Child</CardTitle>
              <CardDescription>Enter your child's code to start tracking their trips</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter child code (e.g., ABC1234)"
                  value={childCode}
                  onChange={(e) => setChildCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button onClick={handleLinkChild}>Link Child</Button>
              </div>
            </CardContent>
          </Card>

          {linkedChildren.length === 0 ? (
            <Card className="border-slate-800">
              <CardContent className="pt-6 text-center text-slate-400">
                No children linked yet. Share your child's code above to start.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {linkedChildren.map((child) => (
                <Card key={child.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">Child #{child.child_code.slice(0, 3)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {child.current_trip ? (
                      <div>
                        <p className="mb-3 text-sm font-semibold text-slate-400">Active Trip</p>
                        <div className="space-y-2">
                          {child.current_trip.events.map((event) => (
                            <div key={event.id} className="rounded bg-slate-800 p-2 text-sm">
                              <p className="font-medium text-slate-50">{event.type.toUpperCase()}</p>
                              <p className="text-slate-400">
                                {event.from_location} → {event.to_location}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No active trip</p>
                    )}
                    {child.trip_history.length > 0 && (
                      <div className="border-t border-slate-800 pt-4">
                        <p className="mb-2 text-xs font-semibold text-slate-500">Trip History ({child.trip_history.length})</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
            <div className="mx-auto max-w-3xl">
              <SettingsPanel
                onBackendUrlSaved={(savedUrl) => {
                  setBackendUrl(savedUrl);
                }}
              />
            </div>
          ) : selectedChild ? (
            // Child Detail View
            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
              <div>
                <ChildPanel
                  child={selectedChild}
                  onBack={() => setSelectedChild(null)}
                />
              </div>
              <div className="min-h-[500px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <MapView data={null} />
              </div>
            </div>
          ) : (
            // Parent Dashboard View
            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
              <div>
                <ParentDashboard onSelectChild={setSelectedChild} />
              </div>
              <div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      <Map className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      Quick Info
                    </h2>
                  </div>

                  <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                        How to Use:
                      </p>
                      <ul className="space-y-2 list-disc list-inside">
                        <li>Create children using the form above</li>
                        <li>Click on a child to manage their trip</li>
                        <li>Start trips and add events</li>
                        <li>Track real-time locations</li>
                        <li>Auto-refresh every 15 seconds</li>
                      </ul>
                    </div>

                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                      <p className="font-medium text-slate-900 dark:text-slate-50 mb-2">
                        Event Types:
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {[
                          "Flight",
                          "Train",
                          "Bus",
                          "Car",
                          "Hostel",
                          "Hotel",
                        ].map((type) => (
                          <div
                            key={type}
                            className="px-2 py-1 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 p-3">
                      <p className="text-emerald-900 dark:text-emerald-300 text-xs">
                        ✓ All data is saved automatically. Changes sync with the
                        backend every 15 seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </ErrorBoundary>
  );
}
