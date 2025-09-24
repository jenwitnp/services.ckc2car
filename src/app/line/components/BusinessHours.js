import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Select from "@/app/components/ui/Select";
import Switch from "@/app/components/ui/Switch";
import { AlertCircle } from "lucide-react";
import { useLineConfig } from "./LineConfigProvider";

export default function BusinessHours() {
  const { config, setConfig } = useLineConfig();

  return (
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
        <p className="text-main-400">กำหนดเวลาที่ระบบจะตอบกลับอัตโนมัติ</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">เวลาเริ่ม</label>
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
            <label className="block text-sm font-medium mb-2">เขตเวลา</label>
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
      </CardContent>
    </Card>
  );
}
