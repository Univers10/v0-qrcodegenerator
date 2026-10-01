import type { Metadata } from "next"

import { PageHeader } from "@/components/dashboard/page-header"
import { AppearanceForm, DangerZone, PasswordForm, ProfileForm } from "@/components/dashboard/settings-forms"
import { requireSession } from "@/lib/auth"

export const metadata: Metadata = { title: "Paramètres" }

export default async function SettingsPage() {
  const session = await requireSession()
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Paramètres" description="Gérez votre compte et vos préférences." />
      <div className="space-y-6">
        <ProfileForm name={session.user.name} email={session.user.email} />
        <AppearanceForm />
        <PasswordForm />
        <DangerZone />
      </div>
    </div>
  )
}
