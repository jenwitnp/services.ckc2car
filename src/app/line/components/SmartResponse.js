import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea"; // ✅ Add Textarea import
import Select from "@/app/components/ui/Select";
import Switch from "@/app/components/ui/Switch";
import { MessageSquare, Calendar, Phone, Brain } from "lucide-react";
import { useLineConfig } from "./LineConfigProvider";

export default function SmartResponse() {
  const { config, setConfig } = useLineConfig();

  const updateTemplate = (key, value) => {
    setConfig({
      ...config,
      templates: {
        ...config.templates,
        [key]: value,
      },
    });
  };

  const updateAI = (key, value) => {
    setConfig({
      ...config,
      ai: {
        ...config.ai,
        [key]: value,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Response Settings</CardTitle>
        <p className="text-main-400">
          ปรับแต่งการตอบกลับอัจฉริยะตามประเภทข้อความ
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Intent Response Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Textarea
                label="การทักทาย"
                icon={MessageSquare}
                iconPosition="left"
                rows={3}
                placeholder="ป้อนข้อความสำหรับการทักทาย..."
                value={config.templates?.greeting || ""}
                onChange={(e) => updateTemplate("greeting", e.target.value)}
                showCharacterCount
                maxLength={500}
              />
            </div>

            <div>
              <Textarea
                label="สอบถามรถ"
                rows={3}
                placeholder="ป้อนข้อความสำหรับการสอบถามรถยนต์..."
                value={config.templates?.carInquiry || ""}
                onChange={(e) => updateTemplate("carInquiry", e.target.value)}
                showCharacterCount
                maxLength={500}
              />
            </div>

            <div>
              <Textarea
                label="ราคา"
                icon={Calendar}
                iconPosition="left"
                rows={3}
                placeholder="ป้อนข้อความสำหรับการสอบถามราคา..."
                value={config.templates?.pricing || ""}
                onChange={(e) => updateTemplate("pricing", e.target.value)}
                showCharacterCount
                maxLength={500}
              />
            </div>

            <div>
              <Textarea
                label="ติดต่อ"
                icon={Phone}
                iconPosition="left"
                rows={3}
                placeholder="ป้อนข้อความสำหรับการติดต่อ..."
                value={config.templates?.contact || ""}
                onChange={(e) => updateTemplate("contact", e.target.value)}
                showCharacterCount
                maxLength={500}
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
                  <Switch
                    checked={config.ai?.useContext}
                    onCheckedChange={(checked) =>
                      updateAI("useContext", checked)
                    }
                  />
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
                  <Switch
                    checked={config.ai?.useCarData}
                    onCheckedChange={(checked) =>
                      updateAI("useCarData", checked)
                    }
                  />
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
                    value={config.ai?.maxLength || 200}
                    onChange={(e) =>
                      updateAI("maxLength", parseInt(e.target.value) || 200)
                    }
                    min="50"
                    max="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    ระดับความเป็นธรรมชาติ
                  </label>
                  <Select
                    value={config.ai?.naturalness?.toString() || "0.7"}
                    onValueChange={(value) =>
                      updateAI("naturalness", parseFloat(value))
                    }
                  >
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
  );
}
