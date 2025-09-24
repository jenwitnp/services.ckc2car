import { Card, CardContent } from "@/app/components/ui/Card";
import { MessageSquare, Bot, Zap, Users, BarChart3 } from "lucide-react";
import { useLineConfig } from "./LineConfigProvider";

export default function StatsCards() {
  const { stats } = useLineConfig();

  const statItems = [
    {
      icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
      label: "ข้อความวันนี้",
      value: stats.todayMessages,
    },
    {
      icon: <Bot className="w-5 h-5 text-green-600" />,
      label: "ตอบกลับแล้ว",
      value: stats.todayResponses,
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      label: "เวลาเฉลี่ย",
      value: stats.avgResponseTime,
    },
    {
      icon: <Users className="w-5 h-5 text-purple-600" />,
      label: "ผู้ใช้",
      value: stats.uniqueUsers,
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
      label: "อัตราตอบ",
      value: stats.autoResponseRate,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statItems.map((item, index) => (
        <Card key={index} className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {item.icon}
              <div>
                <p className="text-xs text-gray-600">{item.label}</p>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
