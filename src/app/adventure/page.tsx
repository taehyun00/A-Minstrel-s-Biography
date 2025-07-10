"use client";

import { supabase } from "../../../suparbase";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import attack from "../images/attack.svg";
import defense from "../images/defense.svg";
import run from "../images/run.svg";
import Image from "next/image";
import { calculateDamage, Stats } from "../utils/attack";
import { useMemo } from "react";

export default function Adventure() {
  const [playername, setPlayername] = useState<string | null>(null);
  const [level, setLevel] = useState<number>(0);
  const [MYstats, setMYStats] = useState({ attack: 0, defense: 0, critical: 0 });
  const [stats, setStats] = useState({ attack: 0, defense: 0, hp: 0, critical: 0 });
  const [playerStats, setPlayerStats] = useState({
    attack: 0,
    defense: 0,
    hp: 0,
    critical: 0,
    exp: 0,
    maxexp: 10,
  });
  const [monsterState, setMonsterState] = useState<{
    name: string;
    level: number;
    attack: number;
    defense: number;
    hp: number;
    critical: number;
  } | null>(null);

  const [monsterHp, setMonsterHp] = useState<number | null>(null);
  const [hpColor, setHpColor] = useState<string>("white");




  const [log, setLog] = useState<string[]>([
    "어두운 눈앞이 밝아지고 끝없이 이어진 길을 따라갔다.",
  ]);
  const [hasFetchedPlayer, setHasFetchedPlayer] = useState(false);
  const router = useRouter();

  // 1) 로컬스토리지에서 name, level 불러오기
  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedLevel = localStorage.getItem("level");
    if (storedName) setPlayername(storedName);
    if (storedLevel) setLevel(Number(storedLevel));
  }, []);

  // 2) playername이 세팅된 이후에만 플레이어 기본 스탯 fetch
  useEffect(() => {
    if (!playername || hasFetchedPlayer) return;

    const fetchPlayerStats = async () => {
      const { data, error } = await supabase
        .from("player")
        .select("attack, defense, hp, critical, exp, maxexp")
        .eq("playername", playername); // 실제 컬럼명 확인!

      if (error) {
        console.error("플레이어 fetch 에러:", error);
      } else if (data && data.length > 0) {
        // 첫 번째 레코드만 사용
        const entry = data[0];
        setPlayerStats({
          attack: entry.attack,
          defense: entry.defense,
          hp: entry.hp,
          critical: entry.critical,
          exp: entry.exp,
          maxexp: entry.maxexp,
        });
        console.log("플레이어 스탯:", entry);
      } else {
        console.warn("플레이어 데이터가 없습니다:", data);
      }

      setHasFetchedPlayer(true);
      // 이후 모험 로직 시작
      advanceAdventure();
    };

    fetchPlayerStats();
  }, [playername, hasFetchedPlayer]);

  // 3) 장비 스탯 합산 & 몬스터 마주치기
  const advanceAdventure = async () => {
    if (!playername) return;

    // 장비 스탯 불러오기
    const { data: equipData, error: equipError } = await supabase
      .from("player_equip")
      .select(`
        equipment:equipment_name (
          attack,
          defense,
          hp,
          critical
        )
      `)
      .eq("player_name", playername)
      .eq("isequip", true);

    if (equipError) {
      console.error("장비 fetch 에러:", equipError);
    } else if (equipData) {
      const totalEquipStats = equipData.reduce(
        (acc: any, row: any) => {
          if (row.equipment) {
            acc.attack += row.equipment.attack || 0;
            acc.defense += row.equipment.defense || 0;
            acc.hp += row.equipment.hp || 0;
            acc.critical += row.equipment.critical || 0;
          }
          return acc;
        },
        { attack: 0, defense: 0, hp: 0, critical: 0 },
        
      );
      const combinedStats = {
        attack: totalEquipStats.attack + playerStats.attack,
        defense: totalEquipStats.defense + playerStats.defense,
        hp: totalEquipStats.hp + playerStats.hp,
        critical: totalEquipStats.critical + playerStats.critical,
      };
      setMYStats(combinedStats);
      setStats(totalEquipStats);
      console.log("장비 스탯 합산:", totalEquipStats);
    }

    // 몬스터 마주치기
    try {
      const { data: monsterData, error: monsterError } = await supabase
        .from("monster")
        .select("*")
        .lte("level", level + 5);

      if (monsterError) {
        console.error("몬스터 fetch 에러:", monsterError);
      } else if (monsterData && monsterData.length > 0) {
        const m = monsterData[Math.floor(Math.random() * monsterData.length)];
        setMonsterState(m);
        setMonsterHp(m.hp)
        setLog((prev) => [...prev, `${m.name}를(을) 마주했다!`]);
      }
    } catch (e) {
      console.error("몬스터 마주치기 예외:", e);
    }

    setLog((prev) => [...prev, "어떻게할까?"]);
  };

  function backhome() {
    router.push("/lobby");
  }

  // 4) 장비 획득 함수
  async function gaka() {
    if (!playername) {
      setLog((prev) => [...prev, "플레이어 이름이 없습니다."]);
      return;
    }

    const randId = Math.floor(Math.random() * 94) + 7; // 7~100 중 랜덤
    try {
      const { data: eq, error: eqErr } = await supabase
        .from("equipment")
        .select("id, name")
        .eq("id", randId);

      if (eqErr || !eq || eq.length === 0) {
        setLog((prev) => [...prev, "장비를 찾지 못했습니다."]);
        return;
      }

      const { id: equipId, name: equipName } = eq[0];
      const { error: insertErr } = await supabase.from("player_equip").insert([
        {
          player_name: playername,
          equipment_name: equipName,
          isequip: false,
          // valueid 자동 생성 설정이 되어 있다면 생략 가능
          // 그렇지 않다면 UUID를 직접 넣어주세요
        },
      ]);

      if (insertErr) {
        setLog((prev) => [...prev, "장비 삽입 실패"]);
      } else {
        setLog((prev) => [...prev, `${equipName} 획득 성공!`]);
        advanceAdventure();
      }
    } catch (e) {
      console.error("gaka 예외 발생:", e);
      setLog((prev) => [...prev, "모험 중 오류 발생"]);
    }
  }

  async function animateHpDecrease(damage: number): Promise<number> {
    let finalHp = monsterHp ?? 0;
  
    for (let i = 0; i < damage; i++) {
      finalHp = Math.max(finalHp - 1, 0);
      setMonsterHp(finalHp);
      setHpColor("red");
      await new Promise(res => setTimeout(res, 5));
    }
  
    setHpColor("white");
    return finalHp;
  }

  async function handleAttack() {
    if (!monsterState || monsterHp === null) return;
  
    const monsterStats: Stats = {
      attack: monsterState.attack,
      defense: monsterState.defense,
      critical: monsterState.critical,
    };
    const PlayerStats: Stats = {
      attack: playerStats.attack + MYstats.attack,
      defense: playerStats.defense + MYstats.defense,
      critical: playerStats.critical + MYstats.critical
    };
  
    const { damageDealt, wasCritical } = calculateDamage(PlayerStats, monsterStats);
  
    const finalHp = await animateHpDecrease(damageDealt);
  
    setLog(prev => [
      ...prev,
      `플레이어 → ${monsterState.name} 공격! 데미지: ${damageDealt}${wasCritical ? " (크리티컬!)" : ""}`,
    ]);
  
    if (finalHp <= 0) {
      setLog(prev => [...prev, `${monsterState.name}를 물리쳤다!`]);
      gaka();
    }
  }

  return (
    <div className="flex items-center justify-center">
      <div className="h-[100vh] w-[90vh] bg-black flex flex-col items-center">
        <p
          className="text-white text-[1.8vh] self-start m-6 cursor-pointer transition-all duration-300  hover:text-[2vh]"
          onClick={backhome}
        >
          돌아가기
        </p>

        {/* 플레이어 & 몬스터 스탯 박스 */}
        <div className="flex flex-col gap-6">
          <div className="border-2 border-gray-600 w-[50vh] h-[10vh] p-4 rounded-lg flex flex-col justify-center">
            <p className="text-white text-xl">{playername}</p>
            <div className="text-white flex space-x-4">
              <p>레벨: {level}</p>
              <p>공격력: {stats.attack + playerStats.attack}</p>
              <p>방어력: {stats.defense + playerStats.defense}</p>
              <p>체력: {stats.hp + playerStats.hp}</p>
              <p>치명타: {stats.critical + playerStats.critical}%</p>
            </div>
          </div>

          <div className="border-2 border-gray-600 w-[50vh] h-[10vh] p-4 rounded-lg flex flex-col justify-center">
            <p className="text-white text-xl">
              {monsterState ? monsterState.name : "훈련용 허수아비"}
            </p>
            <div className="text-white flex space-x-4 mt-2">
              <p>레벨: {monsterState?.level ?? 1}</p>
              <p>공격력: {monsterState?.attack ?? 1}</p>
              <p>방어력: {monsterState?.defense ?? 1}</p>
              <p style={{ color: hpColor }}>체력: {monsterHp ?? "-"}</p>
              <p>치명타: {monsterState?.critical ?? 1}%</p>
            </div>
          </div>
        </div>

        {/* 로그 박스 */}
        <div className="mt-10 text-white text-base h-[30vh] overflow-y-auto w-[70vh] bg-gray-900 p-4 rounded-2xl">
          {log.map((entry, i) => (
            <p key={i}>• {entry}</p>
          ))}
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-row gap-[1vh] mt-[3vh]">
          <div className="border-[2px] border-[#FFFFFF] text-[#FFFFFF] w-[20vh] h-[5vh] rounded-[1vh] flex text-center items-center justify-center text-[2vh] gap-[2vh] transition-all duration-300 hover:w-[23vh]  cursor-pointer" onClick={()=> {handleAttack()}}><Image src={attack} alt="공격" width={20} height={20}/>공격</div>
          <div className="border-[2px] border-[#FFFFFF] text-[#FFFFFF] w-[20vh] h-[5vh] rounded-[1vh] flex text-center items-center justify-center text-[2vh] gap-[2vh] transition-all duration-300 hover:w-[23vh] cursor-pointer"><Image src={defense} alt="공격" width={16} height={16}/>방어</div>
          <div className="border-[2px] border-[#FFFFFF] text-[#FFFFFF] w-[20vh] h-[5vh] rounded-[1vh] flex text-center items-center justify-center text-[2vh] gap-[2vh] transition-all duration-300 hover:w-[23vh] cursor-pointer"><Image src={run} alt="공격" width={18} height={18}/>도망</div>
        </div>
        </div>
      </div>
  );
}
