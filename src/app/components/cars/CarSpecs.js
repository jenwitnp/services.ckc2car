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
      value: specs.used_mile,
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
      value: `เริ่มต้น ${formatNumber(specs.down_price)} บาท`,
    },
    {
      icon: CreditCard,
      label: "ผ่อน",
      value: formatNumber(specs.ins_price),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {specItems.map((item, index) => {
        const IconComponent = item.icon;

        return (
          <div key={index} className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-main-500 dark:text-main-400">
                {item.label}
              </p>
              <p className="text-gray-900 dark:text-white font-medium">
                {item.value || "N/A"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// SpecIcon component can now be removed since we're using Lucide icons directly
