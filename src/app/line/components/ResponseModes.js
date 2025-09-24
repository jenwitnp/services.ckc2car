import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Input from "@/app/components/ui/Input";
import Switch from "@/app/components/ui/Switch";
import { Pause, Users, MessageSquare, Brain } from "lucide-react";
import { useLineConfig } from "./LineConfigProvider";

const responseModes = [
  {
    id: "off",
    name: "ปิดใช้งาน",
    description: "ไม่ตอบกลับอัตโนมัติเลย",
    icon: <Pause className="w-5 h-5" />,
    color: "bg-main-600",
    features: ["ไม่มีการตอบกลับ", "เก็บข้อความเท่านั้น"],
  },
  {
    id: "manual",
    name: "Manual Response",
    description: "ตอบกลับอัตโนมัติแบบเรียบง่าย",
    icon: <MessageSquare className="w-5 h-5" />,
    color: "bg-green-500",
    features: ["ตอบทันที", "ข้อความมาตรฐาน", "ตรวจสอบเวลาทำงาน"],
  },
  {
    id: "hybrid",
    name: "Semi-ai",
    description: "กึ่ง AI",
    icon: <Users className="w-5 h-5" />,
    color: "bg-blue-500",
    features: ["AI ตอบเฉพาะข้อความสำคัญ", "คุมคุณภาพ"],
  },
  {
    id: "ai",
    name: "AI Assistant",
    description: "AI 100%",
    icon: <Brain className="w-5 h-5" />,
    color: "bg-purple-500",
    features: ["AI เต็มรูปแบบ", "บริบทการสนทนา", "ตอบแบบธรรมชาติ"],
  },
];

export default function ResponseModes() {
  const { config, setConfig } = useLineConfig();

  return (
    <Card>
      <CardHeader>
        <CardTitle>เลือกโหมดการตอบกลับ</CardTitle>
        <p className="text-main-400">กำหนดวิธีการตอบกลับลูกค้าในระบบ LINE</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {responseModes.map((mode) => (
            <Card
              key={mode.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                config.mode === mode.id
                  ? "border-main-600 bg-main-600"
                  : "border-main-500 hover:border-main-500"
              }`}
              onClick={() => setConfig({ ...config, mode: mode.id })}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-lg ${mode.color} text-white`}>
                    {mode.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{mode.name}</h3>
                    <p className="text-sm text-main-400 mt-1">
                      {mode.description}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {mode.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="default"
                        className="text-xs mr-1"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  {config.mode === mode.id && (
                    <Badge variant="success">เลือกอยู่</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
