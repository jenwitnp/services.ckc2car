import { useState } from "react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Badge from "@/app/components/ui/Badge";
import ModalBox from "@/app/components/ui/ModalBox";
import { RefreshCw, Play } from "lucide-react";
import { useLineConfig } from "./LineConfigProvider";

const responseModes = [
  { id: "off", name: "ปิดใช้งาน" },
  { id: "manual", name: "Manual Only" },
  { id: "auto", name: "Auto Response" },
  { id: "ai", name: "AI Assistant" },
];

export default function TestModal({ isOpen, onClose }) {
  const { config, testResponse } = useLineConfig();
  const [testMessage, setTestMessage] = useState("");
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    if (!testMessage.trim()) return;

    setTestResult({ loading: true });
    const result = await testResponse(testMessage);
    setTestResult(result);
  };

  const handleClose = () => {
    setTestMessage("");
    setTestResult(null);
    onClose();
  };

  return (
    <ModalBox
      isOpen={isOpen}
      onClose={handleClose}
      title="ทดสอบการตอบกลับ"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">ข้อความทดสอบ</label>
          <Input
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="พิมพ์ข้อความที่ต้องการทดสอบ..."
            onKeyPress={(e) => e.key === "Enter" && handleTest()}
          />
        </div>

        <div className="text-sm text-gray-600">
          โหมดปัจจุบัน:{" "}
          <Badge className="ml-1">
            {responseModes.find((m) => m.id === config.mode)?.name}
          </Badge>
        </div>

        {testResult && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">ผลการตอบกลับ:</h4>
            {testResult.loading ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังประมวลผล...</span>
              </div>
            ) : testResult.error ? (
              <div className="text-red-600">{testResult.message}</div>
            ) : (
              <div className="bg-white p-3 rounded border">
                <p>{testResult.response || "ไม่มีการตอบกลับ"}</p>
                {testResult.mode && (
                  <p className="text-xs text-gray-500 mt-2">
                    Mode: {testResult.mode}
                    {testResult.processingTime && (
                      <span className="ml-2">
                        Processing: {testResult.processingTime}ms
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            ปิด
          </Button>
          <Button onClick={handleTest} disabled={!testMessage.trim()}>
            <Play className="w-4 h-4 mr-2" />
            ทดสอบ
          </Button>
        </div>
      </div>
    </ModalBox>
  );
}
