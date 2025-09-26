"use client";
import { Shield, Award, Users, Clock } from "lucide-react";
import SectionHeader from "@/app/(public)/components/ui/SectionHeader";

const WhyChooseUsSection = () => {
  const features = [
    {
      id: 1,
      icon: Shield,
      title: "การรับประกันที่น่าเชื่อถือ",
      description:
        "รับประกันคุณภาพรถยนต์ทุกคัน พร้อมบริการหลังการขายที่ครบครัน",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: 2,
      icon: Award,
      title: "มาตรฐานระดับพรีเมียม",
      description: "ตรวจสอบและรับรองคุณภาพด้วยมาตรฐานสากล ทุกขั้นตอนโปร่งใส",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      id: 3,
      icon: Users,
      title: "ทีมงานมืออาชีพ",
      description:
        "ที่ปรึกษาและช่างเทคนิคที่มีประสบการณ์สูง พร้อมให้คำแนะนำตลอด 24 ชั่วโมง",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: 4,
      icon: Clock,
      title: "บริการรวดเร็ว",
      description: "ดำเนินการอนุมัติเครดิตและส่งมอบรถภายใน 24 ชั่วโมง",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const stats = [
    { number: "10+", label: "ปีประสบการณ์" },
    { number: "5,000+", label: "ลูกค้าที่พึงพอใจ" },
    { number: "15+", label: "ยี่ห้อรถชั้นนำ" },
    { number: "100%", label: "การบริการที่ใส่ใจ" },
  ];

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title="ทำไมต้องเลือก CARS X"
          subtitle="เราให้มากกว่าการขายรถ เรามอบประสบการณ์ที่ดีที่สุดให้กับคุณ"
          align="center"
          showViewAll={false}
        />

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                className="text-center group hover:transform hover:scale-105 transition-all duration-200"
              >
                <div
                  className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-200`}
                >
                  <IconComponent className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              ตัวเลขที่พูดแทนความน่าเชื่อถือ
            </h3>
            <p className="text-red-100">
              ความไว้วางใจจากลูกค้าคือสิ่งที่เราให้ความสำคัญมากที่สุด
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-yellow-300 mb-2">
                  {stat.number}
                </div>
                <div className="text-red-100 text-sm lg:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certification Section */}
        <div className="mt-12 text-center">
          <h4 className="text-xl font-bold text-gray-800 mb-6">
            ได้รับการรับรองจาก
          </h4>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-gray-400 font-semibold">ISO 9001:2015</div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-gray-400 font-semibold">สมาคมผู้ค้ารถยนต์</div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-gray-400 font-semibold">มาตรฐาน AA</div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-gray-400 font-semibold">ใบอนุญาต กทม.</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
