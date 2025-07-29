"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../suparbase";
import React from "react";

type Equipment = {
  id: number;
  name: string;
  attack: number;
  defense: number;
  hp: number;
  critical: number;
  location: string;
  grade: string;
  valueid: number;
  isequip: boolean;
};

const getGradeColor = (grade?: string) => {
  if (!grade) return "text-gray-300";
  switch (grade.toLowerCase()) {
    case "common": return "text-white";
    case "rare": return "text-blue-400";
    case "epic": return "text-purple-400";
    case "legend": return "text-yellow-300";
    default: return "text-gray-300";
  }
};

function EquipmentDetail({ name }: { name: string }) {
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("name", name)
        .single();

      if (!error) setDetailData(data);
      setLoading(false);
    }

    fetchDetail();
  }, [name]);

  if (loading) return <p className="text-white">로딩 중...</p>;
  if (!detailData) return <p className="text-white">데이터 없음</p>;

  return (
    <div>
      <div className="text-white p-4">
        <h3 className={`text-xl font-bold ${getGradeColor(detailData.grade)}`}>
          {detailData.name} ({detailData.grade})
        </h3>
        <p>위치: {detailData.location}</p>
        <p>공격력: {detailData.attack}</p>
        <p>방어력: {detailData.defense}</p>
        <p>체력: {detailData.hp}</p>
        <p>치명타: {detailData.critical}%</p>
        <p>설명: {detailData.des}</p>
      </div>
    </div>
  );
}


export default function EquipmentPage() {
  const [name, setName] = useState("");
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [hoverEquipName, setHoverEquipName] = useState<string | null>(null)
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setName(storedName);
      fetchEquipments(storedName);
    }
  }, []);





  async function fetchEquipments(playerName: string) {
    const { data, error } = await supabase
      .from("player_equip")
      .select(`
    id,
    valueid,
    isequip,
    equipment:equipment_name (
      id,
      name,
      attack,
      defense,
      hp,
      critical,
      location,
      grade
    )
  `)
      .eq("player_name", playerName);



    if (error) {
      console.error("장비 불러오기 실패:", error.message);
      return;
    }

    const mapped: Equipment[] = (data ?? [])
      .filter((entry: any) => entry.equipment) // equipment가 존재하는 경우만
      .map((entry: any) => ({
        id: entry.id,
        name: entry.equipment.name,
        attack: entry.equipment.attack,
        defense: entry.equipment.defense,
        hp: entry.equipment.hp,
        critical: entry.equipment.critical,
        location: entry.equipment.location,
        grade: entry.equipment.grade,
        valueid: entry.valueid, // 여기서 직접 꺼냄 (equipment가 아님!)
        isequip: entry.isequip
      }));


    setEquipments(mapped);
  }

  type PlayerEquipItem = {
    id: number;
    equipment: {
      location: string;
    };
  };

  async function toggleEquip(equip: Equipment) {

    try {
      if (equip.isequip) {

        const { data: uneqData, error: uneqErr } = await supabase
          .from("player_equip")
          .update({ isequip: false })
          .eq("player_name", name)
          .eq("id", equip.id);

        if (uneqErr) {
          console.error("언착용 업데이트 에러:", uneqErr);
          return;
        }

        await fetchEquipments(name);
        return;
      } else {
        const { data: equippedList, error } = await supabase
          .from<any, any>("player_equip")
          .select("id, equipment:equipment_name (location)")
          .eq("player_name", name)
          .eq("isequip", true);

        if (error) throw error;

        const toUnequipIds = equippedList
          ?.filter((old) => old.equipment.location === equip.location)
          .map((old) => old.id) ?? [];

        if (toUnequipIds.length > 0) {
          await supabase
            .from("player_equip")
            .update({ isequip: false })
            .eq("player_name", name)
            .in("id", toUnequipIds);
        }

        // 선택한 장비 장착
        await supabase
          .from("player_equip")
          .update({ isequip: true })
          .eq("player_name", name)
          .eq("id", equip.id);

        await fetchEquipments(name);
      }
    } catch (err) {
      console.error("장비 장착/해제 실패:", err);
    }
  }

  function backhome() {
    router.push("/lobby");
  }

  const equipped = equipments.filter((e) => e.isequip);
  const inventory = equipments.filter((e) => !e.isequip);

  return (
    <div className="flex items-center justify-center">
      {hoverEquipName && (
        <div className="h-[40vh] w-[40vh] bg-[#000000] fixed left-[133vh] rounded-[3vh] flex items-center justify-center ">
          <EquipmentDetail name={hoverEquipName} />
        </div>
      )}

      <div className="h-[100vh] w-[90vh] bg-[#000000] flex flex-col text-center items-center overflow-hidden relative">
        <p className="text-[#FFFFFF] text-[1.8vh] absolute top-[7.1vh] left-[13.4vh] transition-all duration-300  hover:text-[2vh] cursor-pointer" onClick={backhome}>돌아가기</p>
        <p className="text-white text-[4vh] mt-[8vh]">장비</p>

        <div className="text-white text-[1.8vh] mt-4">
          <p>총 공격력: {equipped.reduce((a, b) => a + b.attack, 10)}</p>
          <p>총 방어력: {equipped.reduce((a, b) => a + b.defense, 10)}</p>
          <p>체력: {equipped.reduce((a, b) => a + b.hp, 10)}</p>
          <p>치명타 확률: {equipped.reduce((a, b) => a + b.critical, 5)}%</p>
        </div>

        <hr className="border-[1px] border-[#FFFFFF] w-[100%]  absolute top-[35vh]" />
        <p className="text-white text-[2vh] absolute top-[30vh]">장착 장비</p>

        <div className="flex gap-4 justify-center absolute top-[40vh]">
          {equipped.length > 0 ? (
            equipped.map((equip, i) => (
              <div key={i} className="text-center cursor-pointer text-[1.7vh] text-[#FFFFFF] transition-all duration-300  hover:text-[2vh]"
                onClick={() => toggleEquip(equip)}
                onMouseEnter={() => setHoverEquipName(equip.name)}
                onMouseLeave={() => setHoverEquipName(null)}
              >
                <p>{equip.location}</p>
                <p className={`${getGradeColor(equip.grade)}`}>{equip.name}</p>
              </div>
            ))
          ) : (
            <p className="text-white">장착된 장비가 없습니다.</p>
          )}
        </div>
        <hr className="border-[1px] border-[#FFFFFF] w-[100%]  absolute top-[50vh]" />
        <p className="text-white text-[2vh] absolute top-[53vh]">보유 장비</p>
        <hr className="border-[1px] border-[#FFFFFF] w-[100%] absolute top-[58vh]" />
        <div className="grid grid-cols-5 gap-7 overflow-y-auto h-[40vh] absolute top-[60vh]">
          {inventory.length > 0 ? (
            inventory.map((equip, i) => (
              <div key={i} className="text-center cursor-pointer text-[1.7vh] text-[#FFFFFF] transition-all duration-300  hover:text-[2vh]"
                onClick={() => toggleEquip(equip)}
                onMouseEnter={() => setHoverEquipName(equip.name)}
                onMouseLeave={() => setHoverEquipName(null)}
              >
                <p >{equip.location}</p>
                <p className={`${getGradeColor(equip.grade)}`}>{equip.name}</p>
              </div>
            ))
          ) : (
            <p className="text-white col-span-5">보유 장비가 없습니다.장비를 획득해보세요!</p>
          )}
        </div>
      </div>
    </div>
  );
}
