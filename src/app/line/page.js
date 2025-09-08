"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Switch from "@/app/components/ui/Switch";
import Select from "@/app/components/ui/Select";
import Input from "@/app/components/ui/Input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/Tabs";
import Badge from "@/app/components/ui/Badge";
import ModalBox from "@/app/components/ui/ModalBox";
import {
  Settings,
  MessageSquare,
  Bot,
  Clock,
  Users,
  Brain,
  Bell,
  BarChart3,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Eye,
  FileText,
  Zap,
  Shield,
  Calendar,
  Phone,
} from "lucide-react";

export default function AdminConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState(null);

  // Configuration states
  const [config, setConfig] = useState({
    mode: "auto",
    autoResponseDelay: 0,
    enableSmartResponse: true,
    businessHours: {
      enabled: true,
      start: "09:00",
      end: "18:00",
      timezone: "Asia/Bangkok",
    },
  });

  // Statistics state
  const [stats, setStats] = useState({
    todayMessages: 0,
    todayResponses: 0,
    avgResponseTime: "0s",
    uniqueUsers: 0,
    autoResponseRate: "0%",
  });

  // Response modes configuration
  const responseModes = [
    {
      id: "off",
      name: "ปิดใช้งาน",
      description: "ไม่ตอบกลับอัตโนมัติเลย",
      icon: <Pause className="w-5 h-5" />,
      color: "bg-gray-500",
      features: ["ไม่มีการตอบกลับ", "เก็บข้อความเท่านั้น"],
    },
    {
      id: "manual",
      name: "Manual Only",
      description: "แอดมินตอบเองทั้งหมด",
      icon: <Users className="w-5 h-5" />,
      color: "bg-blue-500",
      features: ["แจ้งเตือนแอดมิน", "ไม่ตอบอัตโนมัติ", "คุมคุณภาพ"],
    },
    {
      id: "auto",
      name: "Auto Response",
      description: "ตอบกลับอัตโนมัติแบบเรียบง่าย",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "bg-green-500",
      features: ["ตอบทันที", "ข้อความมาตรฐาน", "ตรวจสอบเวลาทำงาน"],
    },
    {
      id: "ai",
      name: "AI Assistant",
      description: "AI ตอบกลับอัจฉริยะ",
      icon: <Brain className="w-5 h-5" />,
      color: "bg-purple-500",
      features: ["AI เต็มรูปแบบ", "บริบทการสนทนา", "ตอบแบบธรรมชาติ"],
    },
  ];

  // Load current configuration
  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/v1/line/admin-coversation?action=config"
      );
      const result = await response.json();

      if (result.success) {
        setConfig(result.config);
      }
    } catch (error) {
      console.error("Failed to load config:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `/api/v1/line/admin-coversation?action=daily_summary&date=${today}`
      );
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setStats({
          todayMessages: data.total_messages,
          todayResponses: data.admin_responses,
          avgResponseTime: "1.2s", // Would calculate from actual data
          uniqueUsers: data.unique_users,
          autoResponseRate:
            data.total_messages > 0
              ? `${Math.round(
                  (data.admin_responses / data.total_messages) * 100
                )}%`
              : "0%",
        });
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);

      // In a real implementation, you'd send this to your config API
      const response = await fetch("/api/v1/line/admin-coversation/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert("บันทึกการตั้งค่าเรียบร้อย");
      } else {
        throw new Error("Failed to save config");
      }
    } catch (error) {
      console.error("Failed to save config:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  // Fix the testResponse function name conflict
  const testTheResponse = async () => {
    if (!testMessage.trim()) return;

    try {
      setTestResponse({ loading: true });

      const response = await fetch("/api/v1/line/admin-coversation/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: testMessage,
          mode: config.mode,
          config: config,
        }),
      });

      const result = await response.json();
      setTestResponse(result);
    } catch (error) {
      setTestResponse({
        error: true,
        message: "เกิดข้อผิดพลาดในการทดสอบ",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">กำลังโหลดการตั้งค่า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                LINE Admin Conversation Config
              </h1>
              <p className="text-gray-600">
                จัดการการตั้งค่าการตอบกลับอัตโนมัติของแอดมิน
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setShowTestModal(true)}>
                <Eye className="w-4 h-4 mr-2" />
                ทดสอบ
              </Button>
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

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">ข้อความวันนี้</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.todayMessages}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">ตอบกลับแล้ว</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.todayResponses}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-xs text-gray-600">เวลาเฉลี่ย</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.avgResponseTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">ผู้ใช้</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.uniqueUsers}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-gray-600">อัตราตอบ</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.autoResponseRate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="modes" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="modes" className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>โหมดตอบกลับ</span>
            </TabsTrigger>
            <TabsTrigger
              value="business-hours"
              className="flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>เวลาทำงาน</span>
            </TabsTrigger>
            <TabsTrigger
              value="smart-response"
              className="flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>Smart Response</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center space-x-2"
            >
              <Bell className="w-4 h-4" />
              <span>การแจ้งเตือน</span>
            </TabsTrigger>
          </TabsList>

          {/* Response Modes Tab */}
          <TabsContent value="modes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>เลือกโหมดการตอบกลับ</CardTitle>
                <p className="text-gray-600">
                  กำหนดวิธีการตอบกลับลูกค้าในระบบ LINE
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {responseModes.map((mode) => (
                    <Card
                      key={mode.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                        config.mode === mode.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setConfig({ ...config, mode: mode.id })}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div
                            className={`p-3 rounded-lg ${mode.color} text-white`}
                          >
                            {mode.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold">{mode.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {mode.description}
                            </p>
                          </div>
                          <div className="space-y-1">
                            {mode.features.map((feature, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          {config.mode === mode.id && (
                            <Badge className="bg-blue-500">เลือกอยู่</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Mode Settings */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">
                    การตั้งค่าสำหรับโหมด:{" "}
                    {responseModes.find((m) => m.id === config.mode)?.name}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        หน่วงเวลาตอบกลับ (วินาที)
                      </label>
                      <Input
                        type="number"
                        value={config.autoResponseDelay}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            autoResponseDelay: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="30"
                        placeholder="0 = ตอบทันที"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        หน่วงเวลาก่อนส่งข้อความตอบกลับ (ดูเป็นธรรมชาติ)
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={config.enableSmartResponse}
                        onCheckedChange={(checked) =>
                          setConfig({
                            ...config,
                            enableSmartResponse: checked,
                          })
                        }
                      />
                      <div>
                        <label className="text-sm font-medium">
                          เปิด Smart Response
                        </label>
                        <p className="text-xs text-gray-500">
                          วิเคราะห์ข้อความและตอบแบบเหมาะสม
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Hours Tab */}
          <TabsContent value="business-hours" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>เวลาทำงาน</span>
                  <Switch
                    checked={config.businessHours.enabled}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        businessHours: {
                          ...config.businessHours,
                          enabled: checked,
                        },
                      })
                    }
                  />
                </CardTitle>
                <p className="text-gray-600">
                  กำหนดเวลาที่ระบบจะตอบกลับอัตโนมัติ
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      เวลาเริ่ม
                    </label>
                    <Input
                      type="time"
                      value={config.businessHours.start}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          businessHours: {
                            ...config.businessHours,
                            start: e.target.value,
                          },
                        })
                      }
                      disabled={!config.businessHours.enabled}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      เวลาสิ้นสุด
                    </label>
                    <Input
                      type="time"
                      value={config.businessHours.end}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          businessHours: {
                            ...config.businessHours,
                            end: e.target.value,
                          },
                        })
                      }
                      disabled={!config.businessHours.enabled}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      เขตเวลา
                    </label>
                    <Select
                      value={config.businessHours.timezone}
                      onValueChange={(value) =>
                        setConfig({
                          ...config,
                          businessHours: {
                            ...config.businessHours,
                            timezone: value,
                          },
                        })
                      }
                      disabled={!config.businessHours.enabled}
                    >
                      <option value="Asia/Bangkok">Bangkok (UTC+7)</option>
                      <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                      <option value="UTC">UTC (UTC+0)</option>
                    </Select>
                  </div>
                </div>

                {config.businessHours.enabled && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        ข้อความนอกเวลาทำงาน
                      </span>
                    </div>
                    <textarea
                      className="w-full p-3 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      rows="3"
                      defaultValue="ขอบคุณสำหรับข้อความของคุณ ขณะนี้อยู่นอกเวลาทำการ เราจะติดต่อกลับในเวลาทำการ (9:00-18:00 น.)"
                      placeholder="ข้อความที่จะส่งเมื่อลูกค้าติดต่อนอกเวลาทำงาน..."
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Smart Response Tab */}
          <TabsContent value="smart-response" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Smart Response Settings</CardTitle>
                <p className="text-gray-600">
                  ปรับแต่งการตอบกลับอัจฉริยะตามประเภทข้อความ
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Intent Response Templates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        การทักทาย
                      </h4>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        rows="3"
                        defaultValue="สวัสดีครับ/ค่ะ ยินดีต้อนรับสู่ CKC Car Services มีอะไรให้เราช่วยเหลือไหมครับ/ค่ะ"
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        สอบถามรถ
                      </h4>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        rows="3"
                        defaultValue="ขอบคุณที่สนใจรถของเราครับ/ค่ะ เรามีรถหลากหลายรุ่นให้เลือก ท่านสนใจรถรุ่นไหนเป็นพิเศษไหมครับ/ค่ะ"
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        ราคา
                      </h4>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        rows="3"
                        defaultValue="เรื่องราคารถ เราจะแจ้งราคาพิเศษให้ท่านครับ/ค่ะ ขอเบอร์โทรติดต่อหน่อยได้ไหมครับ/ค่ะ"
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        ติดต่อ
                      </h4>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        rows="3"
                        defaultValue="แอดมินจะติดต่อกลับไปให้ท่านในไม่ช้าครับ/ค่ะ หรือท่านสะดวกให้เราโทรหาเมื่อไหร่ครับ/ค่ะ"
                      />
                    </div>
                  </div>

                  {/* AI Settings (if mode is AI) */}
                  {config.mode === "ai" && (
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Response Settings
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Switch defaultChecked={true} />
                          <div>
                            <label className="text-sm font-medium">
                              ใช้บริบทการสนทนา
                            </label>
                            <p className="text-xs text-gray-500">
                              AI จะจำการสนทนาก่อนหน้า
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Switch defaultChecked={true} />
                          <div>
                            <label className="text-sm font-medium">
                              ใช้ข้อมูลรถยนต์
                            </label>
                            <p className="text-xs text-gray-500">
                              AI จะใช้ข้อมูลรถในระบบ
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            ความยาวข้อความสูงสุด
                          </label>
                          <Input
                            type="number"
                            defaultValue="200"
                            min="50"
                            max="500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            ระดับความเป็นธรรมชาติ
                          </label>
                          <Select defaultValue="0.7">
                            <option value="0.3">เป็นทางการ</option>
                            <option value="0.7">ปานกลาง</option>
                            <option value="0.9">เป็นกันเอง</option>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>การแจ้งเตือน</CardTitle>
                <p className="text-gray-600">
                  ตั้งค่าการแจ้งเตือนแอดมินเมื่อมีข้อความใหม่
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">แจ้งเตือนข้อความใหม่</span>
                      <p className="text-sm text-gray-600">
                        แจ้งเตือนทันทีเมื่อมีข้อความใหม่
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">แจ้งเตือนนอกเวลาทำงาน</span>
                      <p className="text-sm text-gray-600">
                        แจ้งเตือนเมื่อมีข้อความนอกเวลา
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">
                        แจ้งเตือนข้อผิดพลาด AI
                      </span>
                      <p className="text-sm text-gray-600">
                        เมื่อ AI ตอบกลับไม่ได้
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">ช่องทางการแจ้งเตือน</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <label className="text-sm">LINE Notify</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded" />
                        <label className="text-sm">Email</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded" />
                        <label className="text-sm">Webhook</label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Test Modal */}
        {showTestModal && (
          <ModalBox
            isOpen={showTestModal}
            onClose={() => setShowTestModal(false)}
            title="ทดสอบการตอบกลับ"
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  ข้อความทดสอบ
                </label>
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="พิมพ์ข้อความที่ต้องการทดสอบ..."
                  onKeyPress={(e) => e.key === "Enter" && testResponse()}
                />
              </div>

              <div className="text-sm text-gray-600">
                โหมดปัจจุบัน:{" "}
                <Badge className="ml-1">
                  {responseModes.find((m) => m.id === config.mode)?.name}
                </Badge>
              </div>

              {testResponse && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">ผลการตอบกลับ:</h4>
                  {testResponse.loading ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังประมวลผล...</span>
                    </div>
                  ) : testResponse.error ? (
                    <div className="text-red-600">{testResponse.message}</div>
                  ) : (
                    <div className="bg-white p-3 rounded border">
                      <p>{testResponse.response || "ไม่มีการตอบกลับ"}</p>
                      {testResponse.mode && (
                        <p className="text-xs text-gray-500 mt-2">
                          Mode: {testResponse.mode}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowTestModal(false)}
                >
                  ปิด
                </Button>
                <Button
                  onClick={testTheResponse}
                  disabled={!testMessage.trim()}
                >
                  <Play className="w-4 h-4 mr-2" />
                  ทดสอบ
                </Button>
              </div>
            </div>
          </ModalBox>
        )}
      </div>
    </div>
  );
}
