"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../../suparbase";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isOk, setIsOk] = useState(false);

  function gameStart(names: string, password: string) {
    if (names.length === 0 || password.length === 0) {
      if (!isOk) {
        setIsOk(true);
      }
      return;
    } else {
      if (isOk) {
        setIsOk(false);
      }
      Insertplayer();
    }
  }

  async function Insertplayer() {
    // Get the next ID for the 'player' table
    const { data: playerData, error: selectPlayerError } = await supabase
      .from("player")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    if (selectPlayerError) {
      console.error("ID 가져오기 실패:", selectPlayerError);
      return;
    }

    const nextPlayerId = playerData && playerData.length > 0 ? playerData[0].id + 1 : 1;

    // Insert into 'player' table
    const { error: insertPlayerError } = await supabase
      .from("player")
      .insert({ id: nextPlayerId, playername: name, level: 0, password: password });

    if (insertPlayerError) {
      console.error("플레이어 삽입 실패:", insertPlayerError);
      return;
    }

    // Get the next ID for the 'player_equip' table
    const { data: equipData, error: selectEquipError } = await supabase
      .from("player_equip")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    if (selectEquipError) {
      console.error("ID 가져오기 실패:", selectEquipError);
      return;
    }

    const nextEquipId = equipData && equipData.length > 0 ? equipData[0].id + 1 : 1;

    // Insert into 'player_equip' table
    const { error: insertEquipError } = await supabase.from("player_equip").insert([
      { id: nextEquipId, player_name: name, equipment_name: "초보자의 투구" },
      { id: nextEquipId + 1, player_name: name, equipment_name: "초보자의 흉갑" },
      { id: nextEquipId + 2, player_name: name, equipment_name: "초보자의 팔보호대"},
      { id: nextEquipId + 3, player_name: name, equipment_name: "초보자의 다리보호대"},
      { id: nextEquipId + 4, player_name: name, equipment_name: "초보자의 검"},
      { id: nextEquipId + 5, player_name: name, equipment_name: "초보자의 방패" },
    ]);

    if (insertEquipError) {
      console.error("장비 삽입 실패:", insertEquipError);
      return;
    }

    // Redirect to home page
    router.push("/");
  }

  function backHome() {
    router.push("/");
  }

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="h-[100vh] w-[80vh] bg-[#000000] flex justify-center items-center flex-col gap-[5vh] ">
        <p
          className="text-[#FFFFFF] text-[1.8vh] relative top-[-30vh] mr-[56vh] transition-all duration-300 hover:text-[2vh]"
          onClick={() => backHome()}
        >
          돌아가기
        </p>
        <p className="text-[#FFFFFF] text-[4vh] ">이름과 비밀번호를 지정해주세요</p>

        <input
          type="text"
          className="border-b-[2px] border-[#FFFFFF] text-[#FFFFFF] text-center outline-none w-[20vh] transition-all duration-300 focus:w-[30vh]"
          placeholder="이름을 입력해주세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          className="border-b-[2px] border-[#FFFFFF] text-[#FFFFFF] text-center outline-none w-[20vh] transition-all duration-300 focus:w-[30vh]"
          placeholder="비밀번호를 입력해주세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isOk ? <span className="text-[#ED0000]">비밀번호와 이름을 입력해주세요!</span> : null}
      </div>

      <p
        className="text-[#FFFFFF] text-center relative top-[-30vh] transition-all duration-300 hover:text-[2vh]"
        onClick={() => gameStart(name, password)}
      >
        시작하기
      </p>
    </div>
  );
}
