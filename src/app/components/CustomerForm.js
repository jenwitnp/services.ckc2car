"use client";
import { useForm } from "react-hook-form";
import Input from "./ui/Input";
import InputRow from "./ui/InputRow";
import ModalBox from "./ui/ModalBox";

import { useState, useMemo } from "react";
import AutoComplete, { AutoCompleteList } from "./ui/AutoComplete";
import { provinces } from "../utils/province";
import Button from "./ui/Button";
import Image from "next/image";
import LoadingText from "./ui/LoadingText";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "./ui/Spinner";
import { useUserSession } from "../contexts/UserSessionProvider";
import { useModals } from "../contexts/ModalProvider";
import { addCustomer } from "../services/ckc/customer";
import { carAutocomplete } from "../services/supabase/car";

const fetchCarOptions = async (input) => {
  if (!input) return [];
  return await carAutocomplete(input);
};

const CKC_URL = process.env.NEXT_PUBLIC_CKC_URL || "https://www.ckc2car.com";

export default function CustomerForm() {
  const { isModalsOpen, closeModals, modalsOptions } = useModals();
  const modalData =
    modalsOptions.length > 0
      ? modalsOptions[modalsOptions.length - 1].data
      : {};
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: { ...modalData, car_id: "" },
  });

  const { user } = useUserSession();

  // Province autocomplete
  const [provinceInput, setProvinceInput] = useState(modalData.province || "");
  const [showAuto, setShowAuto] = useState(false);

  const filteredProvinces = useMemo(
    () =>
      provinces.filter(
        (p) =>
          p.name.includes(provinceInput) ||
          p.englishName.toLowerCase().includes(provinceInput.toLowerCase())
      ),
    [provinceInput]
  );

  // Car Autocomplete State
  const [carInput, setCarInput] = useState("");
  const [showCarAuto, setShowCarAuto] = useState(false);
  const [, setSelectedCar] = useState(null);

  const { data: carOptions = [], isLoading: isCarLoading } = useQuery({
    queryKey: ["car-autocomplete", carInput],
    queryFn: () => fetchCarOptions(carInput),
    enabled: !!carInput,
  });

  const { mutate: addCustomerMutate, isPending: isAddingCustomer } =
    useMutation({
      mutationFn: addCustomer,
      onSuccess: () => {
        if (modalData?.id) {
          queryClient.invalidateQueries({
            queryKey: ["exist-customer", modalData.id],
          });
        }
        closeModals();
      },
      onError: (error) => {
        console.log("add error", error);
      },
    });

  const onSubmit = (data) => {
    const { id, ...rest } = data;
    const payload = {
      ...rest,
      ...(id && { facebook_id: id }),
      add_id: user?.id || "",
    };
    addCustomerMutate(payload);
  };

  const handleClose = () => {
    closeModals();
  };

  // Province handlers
  const handleProvinceChange = (e) => {
    setProvinceInput(e.target.value);
    setValue("province", e.target.value, { shouldValidate: true });
    setShowAuto(true);
  };

  const handleSelectProvince = (province) => {
    setProvinceInput(province.name);
    setValue("province", province.name, { shouldValidate: true });
    setValue("provinceId", province.id, { shouldValidate: true });
    setShowAuto(false);
  };

  // Car handlers
  const handleCarInputChange = (e) => {
    setCarInput(e.target.value);
    setShowCarAuto(true);
    setSelectedCar(null);
    setValue("car_id", "");
  };

  const handleSelectCar = (car) => {
    setCarInput(`${car.no_car} - ${car.title}`);
    setSelectedCar(car);
    setValue("car_id", car.id, { shouldValidate: true });
    setShowCarAuto(false);
  };

  return (
    <ModalBox isOpen={isModalsOpen} onClose={handleClose} showFooter={false}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md mx-auto bg-main-900 p-6"
        autoComplete="off"
      >
        <h2 className="text-xl font-bold mb-4 text-main-200">
          เพิ่มลูกค้าใหม่
        </h2>
        <InputRow label="ชื่อ" id="name" isError={errors}>
          <Input
            {...register("name", { required: "กรุณากรอกชื่อ" })}
            placeholder="ชื่อ"
            fit
          />
        </InputRow>

        <InputRow label="เบอร์โทร" id="phone" isError={errors}>
          <Input
            {...register("phone", {
              required: "กรุณากรอกเบอร์โทร",
              pattern: {
                value: /^[0-9]{9,10}$/,
                message: "เบอร์โทรไม่ถูกต้อง",
              },
            })}
            placeholder="เบอร์โทร"
            fit
          />
        </InputRow>

        <InputRow label="จังหวัด" id="province" isError={errors}>
          <div className="relative w-full">
            <Input
              {...register("province", { required: "กรุณากรอกจังหวัด" })}
              placeholder="จังหวัด"
              value={provinceInput}
              onChange={handleProvinceChange}
              onFocus={() => setShowAuto(true)}
              autoComplete="off-province"
              fit
            />
            <AutoComplete
              mapData={
                filteredProvinces.length > 0 ? (
                  filteredProvinces.map((p) => (
                    <AutoCompleteList
                      key={p.name}
                      onClick={() => handleSelectProvince(p)}
                    >
                      <span className="text-xs text-main-500 ml-2">
                        {p.name} - {p.englishName}
                      </span>
                    </AutoCompleteList>
                  ))
                ) : (
                  <AutoCompleteList disabled>ไม่พบจังหวัด</AutoCompleteList>
                )
              }
              isLoading={isCarLoading}
              show={showAuto && provinceInput.length > 0}
            />
          </div>
        </InputRow>

        <InputRow label="รหัสรถ" id="car_id" isError={errors}>
          <div className="relative w-full">
            <Input
              placeholder="ค้นหารหัสรถ"
              value={carInput}
              onChange={handleCarInputChange}
              onFocus={() => setShowCarAuto(true)}
              autoComplete="off"
              fit
              readOnly={false}
              icon={isCarLoading ? <Spinner size="xs" /> : null}
              disabled={isCarLoading}
            />
            <input
              type="hidden"
              {...register("car_id", { required: "กรุณาเลือกรถจากรายการ" })}
            />
            <AutoComplete
              mapData={
                carOptions.length > 0 ? (
                  carOptions.map((car) => (
                    <AutoCompleteList
                      key={car.id}
                      onClick={() => handleSelectCar(car)}
                      icon={
                        <Image
                          src={`${CKC_URL.replace(
                            /\/$/,
                            ""
                          )}/${car.thumbnail.replace(/^\//, "")}`}
                          alt={car.title}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-cover rounded"
                        />
                      }
                    >
                      <span>
                        {car.no_car} - {car.title}
                      </span>
                    </AutoCompleteList>
                  ))
                ) : (
                  <AutoCompleteList disabled>ไม่พบรถ</AutoCompleteList>
                )
              }
              isLoading={isCarLoading}
              show={showCarAuto && carInput.length > 0}
            />
          </div>
        </InputRow>

        <div className="flex justify-end mt-6">
          <Button variant="primary" size="sm" disabled={isAddingCustomer}>
            <LoadingText
              isLoading={isAddingCustomer}
              loadingText="กำลังบันทึก"
              defaultText="บันทึก"
            />
          </Button>
        </div>
      </form>
    </ModalBox>
  );
}
