"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Lock, Users, Database, Shield, Eye } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    dataBackup: true,
    twoFactorAuth: false,
    dataEncryption: true,
  })

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (!user) return null

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">System Settings</h1>
          <p className="text-muted-foreground">Manage system configuration and preferences</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure general system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">System Name</label>
                  <input
                    type="text"
                    defaultValue="HealthCare Management System"
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization Email</label>
                  <input
                    type="email"
                    defaultValue="admin@healthcare.com"
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Support Phone</label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how the system sends notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: "emailNotifications",
                    label: "Email Notifications",
                    description: "Receive email updates for important events",
                    icon: Bell,
                  },
                  {
                    key: "appointmentReminders",
                    label: "Appointment Reminders",
                    description: "Send reminders for upcoming appointments",
                    icon: Bell,
                  },
                ].map(({ key, label, description, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings[key as keyof typeof settings]}
                      onChange={(e) => handleSettingChange(key, e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>
                ))}
                <Button>Save Notification Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage security and access control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: "twoFactorAuth",
                    label: "2-Factor Authentication",
                    description: "Enable additional security layer for admin accounts",
                    icon: Lock,
                  },
                  {
                    key: "dataEncryption",
                    label: "Data Encryption",
                    description: "Encrypt sensitive patient data at rest",
                    icon: Shield,
                  },
                ].map(({ key, label, description, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings[key as keyof typeof settings]}
                      onChange={(e) => handleSettingChange(key, e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>
                ))}
                <Button>Save Security Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Manage User Roles
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  View Access Logs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Settings */}
          <TabsContent value="data" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Configure data backup and maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Automatic Backup</p>
                      <p className="text-xs text-muted-foreground">Enable daily data backups</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dataBackup}
                    onChange={(e) => handleSettingChange("dataBackup", e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-sm font-medium block">Backup Frequency</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>

                <Button className="mt-4">Save Data Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Database Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Database className="w-4 h-4 mr-2" />
                  Run Database Optimization
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Clean up Old Records
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
