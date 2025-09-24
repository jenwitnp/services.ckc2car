"use client";

import { useState } from "react";
import Button from "@/app/components/ui/Button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/Tabs";
import { RefreshCw, Save, Eye, Bot, Clock, Brain } from "lucide-react";

// Import isolated components
import {
  LineConfigProvider,
  useLineConfig,
} from "./components/LineConfigProvider";
import StatsCards from "./components/StatsCards";
import ResponseModes from "./components/ResponseModes";
import BusinessHours from "./components/BusinessHours";
import SmartResponse from "./components/SmartResponse";
import TestModal from "./components/TestModal";

function AdminConfigContent() {
  const { loading, saving, saveConfig } = useLineConfig();
  const [showTestModal, setShowTestModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-main-800 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">กำลังโหลดการตั้งค่า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-main-200 mb-2">
                ตั้งค่าการเชื่อมต่อ LINE
              </h1>
              <p className="text-main-400">
                จัดการการตั้งค่าการตอบกลับอัตโนมัติของไลน์
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button onClick={saveConfig} disabled={saving}>
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                บันทึก
              </Button>
            </div>
          </div>
        </div>

        <div>
          <div className="mt-4">
            <ResponseModes />
          </div>
          <div className="mt-4">
            <BusinessHours />
          </div>
          <div className="mt-4">
            <SmartResponse />
          </div>
        </div>

        {/* Test Modal */}
        <TestModal
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
        />
      </div>
    </div>
  );
}

export default function AdminConfigPage() {
  return (
    <LineConfigProvider>
      <AdminConfigContent />
    </LineConfigProvider>
  );
}
