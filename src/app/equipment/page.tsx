"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../suparbase";

type Equipment = {
  name: string;
  attack: number;
  defense: number;
  hp : number;
  critical : number;
};

type PlayerEquip = {
  player_name: string;
  equipment: Equipment | Equipment[] | null; // equipment는 객체, 배열, 또는 null일 수 있음
};

async function fetchEquip(name: string): Promise<PlayerEquip[]> {
  try {
    const { data, error } = await supabase
      .from("player_equip")
      .select(`
        player_name,
        equipment(
          name,
          attack,
          defense,
          hp,
          critical
        )
      `)
      .eq("player_name", name);

    console.log(data); // 데이터 구조 확인

    if (error) {
      console.error("쿼리 실패:", error.message);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error("예외 발생:", err);
    return [];
  }
}

export default function Equipment() {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [attack, setAttack] = useState(0); // 총 공격력 상태
  const [defense, setDefense] = useState(0); // 총 방어력 상태
  const [hp, setHp] = useState(0);
  const [critical, setCritical] = useState(0);
  const [myEquip, setMyEquip] = useState<PlayerEquip[]>([]);

  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedLevel = localStorage.getItem("level");

    if (storedName) setName(storedName);
    if (storedLevel) setLevel(storedLevel);

    if (storedName) {
      fetchEquip(storedName).then((data) => setMyEquip(data));
    }
  }, []);

  // 공격력과 방어력 계산
  useEffect(() => {
    let totalAttack = 0;
    let totalDefense = 0;
    let totalHp = 0;
    let totalcritical = 0;

    myEquip.forEach((player) => {
      if (Array.isArray(player.equipment)) {
        player.equipment.forEach((equip) => {
          totalAttack += equip.attack;
          totalDefense += equip.defense;
          totalHp += equip.hp;
          totalcritical  += equip.critical;
        });
      } else if (player.equipment) {
        totalAttack += player.equipment.attack;
        totalDefense += player.equipment.defense;
        totalHp += player.equipment.hp;
        totalcritical  += player.equipment.critical;
      }
    });

    setAttack(totalAttack);
    setDefense(totalDefense);
    setHp(totalHp);
    setCritical(totalcritical);
  }, [myEquip]);

  return (
    <div className="flex items-center justify-center">
      <div className="h-[100vh] w-[80vh] bg-[#000000] flex justify-center items-center flex-col">
        <p className="text-[#FFFFFF] text-[4vh]">장비</p>

        {/* 장비 목록 출력 */}
        <div className="flex flex-row gap-[2.7vh]">
          {myEquip.length > 0 ? (
            myEquip.map((player, index) => (
              <div key={index}>
                {Array.isArray(player.equipment) ? (
                  player.equipment.map((equip, equipIndex) => (
                    <div key={equipIndex} className="text-[#FFFFFF] text-[1.4vh]">
                      <p>장비 이름: {equip.name}</p>
                      <p>공격력: {equip.attack}</p>
                      <p>방어력: {equip.defense}</p>
                      
                    </div>
                  ))
                ) : player.equipment ? (
                  <div className="text-[#FFFFFF] text-[1.5vh] text-center">
                    <p className=" text-[1.5vh]">{player.equipment.name}</p>
                    <p>공격력: {player.equipment.attack}</p>
                    <p>방어력: {player.equipment.defense}</p>
                    <p>체력: {player.equipment.hp}</p>
                  </div>
                ) : (
                  <p className="text-[#FFFFFF] text-[2vh]">장비가 없습니다.</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-[#FFFFFF] text-[2vh]">플레이어 데이터가 없습니다.</p>
          )}
        </div>

        {/* 추가 정보 출력 */}
        <div className="text-[#FFFFFF] text-[1.6vh] relative top-[10vh]">
          <p>총 공격력: {attack}</p>
          <p>총 방어력: {defense}</p>
          <p>체력: {hp} </p>
          <p>치명타 확률: {critical}% </p>
        </div>
      </div>
    </div>
  );
}
