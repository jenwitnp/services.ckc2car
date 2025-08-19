import { formatNumber } from "@/app/utils/formatNumber";
import {
  Droplet, // For fuel
  Settings, // For gear/transmission
  Calendar, // For year
  Gauge, // For mileage
  Palette, // For color
  Users, // For car type/seats
  Tag, // For status
  DollarSign, // For down payment
  CreditCard, // For installment payment
} from "lucide-react";

export function CarSpecs({ specs }) {
  // Array of icon mappings and their properties using Lucide icons
  const specItems = [
    {
      icon: Droplet,
      label: "เชื้อเพลิง",
      value: specs.fuel_type,
    },
    {
      icon: Settings,
      label: "เกียร์",
      value: specs.gear,
    },
    {
      icon: Calendar,
      label: "ปี",
      value: specs.years_car,
    },
    {
      icon: Gauge,
      label: "เลขไมล์",
      value: specs.used_mile ? `${formatNumber(specs.used_mile)} กม.` : "N/A",
    },
    {
      icon: Palette,
      label: "สี",
      value: specs.color,
    },
    {
      icon: Users,
      label: "ประเภท",
      value: specs.car_type_title,
    },
    {
      icon: Tag,
      label: "สถานะ",
      value: specs.car_status,
    },
    {
      icon: DollarSign,
      label: "ดาวน์",
      value: specs.down_price
        ? `เริ่มต้น ${formatNumber(specs.down_price)} บาท`
        : "ติดต่อสอบถาม",
    },
    {
      icon: CreditCard,
      label: "ผ่อน",
      value: specs.ins_price
        ? `${formatNumber(specs.ins_price)} บาท/เดือน`
        : "ติดต่อสอบถาม",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {specItems.map((item, index) => {
        const IconComponent = item.icon;

        return (
          <div key={index} className="flex items-start group">
            <div className="w-10 h-10 rounded-full bg-main-100 flex items-center justify-center flex-shrink-0 group-hover:bg-main-200 transition-colors duration-200">
              <IconComponent className="w-5 h-5 text-main-600" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm text-main-500 mb-1 font-medium">
                {item.label}
              </p>
              <p className="text-main-100 font-semibold leading-snug break-words">
                {item.value || "N/A"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
