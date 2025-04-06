import { GoogleDriveSettings } from '@/components/settings/GoogleDriveSettings'

export function SettingsPage() {
    return (
        <div className="container py-8 space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <GoogleDriveSettings />
        </div>
    )
}
