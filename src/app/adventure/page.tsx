"use client";

import { supabase } from "../../../suparbase";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import attack from "../images/attack.svg";
import defense from "../images/defense.svg";
import run from "../images/run.svg";
import Image from "next/image";
import { calculateDamage, Stats } from "../utils/attack";

export default function Adventure() {
  const logRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 상태 관리
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [turn, setTurn] = useState<"player" | "monster">("player");

  const [pd, setpd] = useState(false);
  const [md, setmd] = useState(false);
  const [playerStats, setPlayerStats] = useState({
    level: 0,
    attack: 0,
    defense: 0,
    hp: 0,
    critical: 0,
    exp: 0,
    maxExp: 10,
  });
  const [finalStats, setFinalStats] = useState({
    attack: 0,
    defense: 0,
    hp: 0,
    critical: 0,
  });
  const [monsterState, setMonsterState] = useState<{
    name: string;
    level: number;
    attack: number;
    defense: number;
    hp: number;
    critical: number;
    exp: number;
  } | null>(null);
  const [monsterHp, setMonsterHp] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>(["어두운 눈앞이 밝아지고 끝없이 이어진 길을 따라갔다."]);
  const [colors, setColors] = useState({
    hpColor: "white",
    playerHpColor: "white",
    expColor: "white",
  });

  // 1) 로컬스토리지에서 플레이어 이름 불러오기
  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) setPlayerName(storedName);
  }, []);

  useEffect(() => {
    if (turn === "monster") {
      handleMonsterTurn();
    }
  }, [turn]);

  useEffect(() => {
    if (monsterState) {
      setMonsterHp(monsterState.hp ?? 1); // 몬스터 체력 기본값 설정
    }
  }, [monsterState]);

  useEffect(() => {
    if (finalStats.hp === null || finalStats.hp === undefined) {
      setFinalStats((prev) => ({ ...prev, hp: playerStats.hp ?? 0 })); // 플레이어 체력 기본값 설정
    }
  }, [playerStats]);


  function playerHP(e: number) {
    setFinalStats((prev) => ({
      ...prev,
      hp: e,
    }));
  }

  // 2) 로그 스크롤 자동 업데이트
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  // 3) 플레이어 스탯 불러오기
  useEffect(() => {
    if (!playerName) return;

    const fetchPlayerStats = async () => {
      const { data, error } = await supabase
        .from("player")
        .select("level, attack, defense, hp, critical, exp, maxexp")
        .eq("playername", playerName);

      if (error) {
        console.error("플레이어 fetch 에러:", error);
      } else if (data && data.length > 0) {
        const entry = data[0];

        // Supabase에서 가져온 데이터의 속성 이름을 상태에 맞게 변환
        setPlayerStats({
          level: entry.level,
          attack: entry.attack,
          defense: entry.defense,
          hp: entry.hp,
          critical: entry.critical,
          exp: entry.exp,
          maxExp: entry.maxexp, // 여기서 maxexp를 maxExp로 변환
        });

        calculateFinalStats(entry); // 장비 스탯 계산
        advanceAdventure(); // 모험 시작
      } else {
        console.warn("플레이어 데이터가 없습니다:", data);
      }
    };

    fetchPlayerStats();
  }, [playerName]);


  // 4) 장비 스탯 합산
  const calculateFinalStats = async (baseStats: any) => {
    // 기본 스탯 검증
    const validBaseStats = {
      attack: baseStats.attack ?? 0,
      defense: baseStats.defense ?? 0,
      hp: baseStats.hp ?? 0,
      critical: baseStats.critical ?? 0,
    };

    try {
      const { data, error } = await supabase
        .from("player_equip")
        .select(`
          equipment:equipment_name (
            attack,
            defense,
            hp,
            critical
          )
        `)
        .eq("player_name", playerName)
        .eq("isequip", true);

      if (error) {
        console.error("장비 fetch 에러:", error);
        return; // 에러 발생 시 함수 종료
      }

      // 장비 데이터가 없을 경우 기본값 설정
      const totalEquipStats = (data ?? []).reduce(
        (acc: any, row: any) => {
          if (row.equipment) {
            acc.attack += row.equipment.attack ?? 0;
            acc.defense += row.equipment.defense ?? 0;
            acc.hp += row.equipment.hp ?? 0;
            acc.critical += row.equipment.critical ?? 0;
          }
          return acc;
        },
        { attack: 0, defense: 0, hp: 0, critical: 0 } // 기본값
      );

      // 최종 스탯 계산
      const finalStats = {
        attack: validBaseStats.attack + totalEquipStats.attack,
        defense: validBaseStats.defense + totalEquipStats.defense,
        hp: validBaseStats.hp + totalEquipStats.hp,
        critical: validBaseStats.critical + totalEquipStats.critical,
      };

      // 상태 업데이트
      setFinalStats(finalStats);
    } catch (e) {
      console.error("장비 스탯 계산 예외:", e);
    }
  };


  // 5) 몬스터 마주치기
  const advanceAdventure = async () => {
    try {
      const { data, error } = await supabase
        .from("monster")
        .select("*")
        .lte("level", playerStats.level + 5);

      if (error) {
        console.error("몬스터 fetch 에러:", error);
      } else if (data && data.length > 0) {
        const monster = data[Math.floor(Math.random() * data.length)];
        setLog((prev) => [...prev, `${monster.name}를(을) 마주했다!`]);
        setMonsterState(monster);
        setMonsterHp(monster.hp);
      }
    } catch (e) {
      console.error("몬스터 마주치기 예외:", e);
    }

    setLog((prev) => [...prev, "어떻게할까?"]);
    setTurn("player");
  };

  // 6) 체력 감소 애니메이션
  const animateHpChange = async (
    currentHp: number,
    damage: number,
    isPlayer: boolean
  ): Promise<number> => {
    let newHp = isNaN(currentHp) ? 0 : currentHp; // NaN 방지

    for (let i = 0; i < damage; i++) {
      newHp = Math.max(newHp - 1, 0);
      if (isPlayer) {
        if (newHp == 0) {
          setLog((prev) => [...prev, `${playerName}은 쓰러졌다...`]);
          setTimeout(() => {

          }, 100);
          router.push("/lobby");
        } // 체력 감소, 최소값은 0

        setPlayerStats((prev) => ({ ...prev, hp: newHp }));
        setColors((prev) => ({ ...prev, playerHpColor: "red" }));
        playerHP(newHp);


      } else {
        setMonsterHp(newHp); // 몬스터 체력 업데이트
        setColors((prev) => ({ ...prev, hpColor: "red" }));
      }
      await new Promise((res) => setTimeout(res, 50)); // 애니메이션 딜레이
    }


    // 색상 초기화
    setColors((prev) => ({
      ...prev,
      hpColor: "white",
      playerHpColor: "white",
    }));

    if (isPlayer) {
      const { data, error } = await supabase
        .from("player")
        .update({ hp: (newHp - (finalStats.hp - (10 + playerStats.level))) })
        .eq("playername", playerName);

      if (error) {
        console.error("플레이어 체력 업데이트 에러:", error);
      }
    }

    return newHp;
  };



  // 7) 경험치 증가 애니메이션 및 레벨업
  const animateExpIncrease = async (expGain: number) => {
    let newExp = playerStats.exp + expGain;
    let newLevel = playerStats.level;
    let remainingExp = newExp;
    let newMaxExp = playerStats.maxExp;

    while (remainingExp >= newMaxExp) {
      setColors((prev) => ({
        ...prev,
        expColor: "yellow"
      })); // 경험치 색상을 레벨 업 중으로 변경
      remainingExp -= newMaxExp;
      newLevel++;
      newMaxExp = Math.floor(newMaxExp * 1.2); // 레벨 업 시 maxExp 증가
    }
    setColors((prev) => ({
      ...prev,
      expColor: "white "
    }));  // 경험치 색상을 원래대로 복구

    setPlayerStats((prev) => ({
      ...prev,
      exp: remainingExp,
      maxExp: newMaxExp,
      level: newLevel,
    }));

    try {
      const { data, error } = await supabase
        .from("player")
        .update({ level: newLevel, maxexp: newMaxExp, exp: remainingExp })
        .eq("playername", playerName);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("예상치 못한 오류가 발생했습니다.");
    }
  };

  // 8) 공격 처리
  // 플레이어 공격 처리
  const handleAttack = async () => {
    setpd(false);
    if (!monsterState || monsterHp === null) return;
    const { damageDealt, wasCritical } = calculateDamage(finalStats, monsterState);
    const newHp = await animateHpChange(monsterHp, damageDealt, false);

    setLog((prev) => [
      ...prev,
      `플레이어 → ${monsterState.name} 공격! 데미지: ${damageDealt}${wasCritical ? " (크리티컬!)" : ""
      }`,
    ]);
    setMonsterState((prev) => ({
      ...prev!,
      hp: newHp, // 방어력 증가
    }));

    if (newHp <= 0) {
      setLog((prev) => [
        ...prev,
        `${monsterState.name}를 물리쳤다! 경험치 ${monsterState.exp} 획득!`,
      ]);
      await animateExpIncrease(monsterState.exp);
      setMonsterState(null);
      advanceAdventure();
    } else {
      setTurn("monster"); // 몬스터 턴으로 전환
      // 몬스터 턴 실행
    }
  };

  // 플레이어 방어 처리
  const handleDefense = () => {
    setpd(false);
    setLog((prev) => [...prev, `${playerName}은 방어를 선택했다! 방어력 증가!`]);
    setFinalStats((prev) => ({
      ...prev,
      defense: prev.defense + 5, // 방어력 증가
    }));
    setTurn("monster");
    setpd(true);
    // 몬스터 턴 실행
  };

  // 플레이어 도망 처리
  const handleRun = () => {
    setpd(false);
    const success = Math.random() > 0.3;
    if (success) {
      setLog((prev) => [...prev, `${playerName}은 도망에 성공했다!`]);
      advanceAdventure();
    } else {
      setLog((prev) => [...prev, `${playerName}은 도망에 실패했다!`]);
      setTurn("monster"); // 몬스터 턴으로 전환
      // 몬스터 턴 실행
    }
  };


  // 몬스터 턴 처리 함수 추가
  const handleMonsterTurn = async () => {
    setmd(false);
    if (!monsterState || !finalStats.hp) return;

    const monsterAction = Math.random() > 0.5 ? "attack" : "defense"; // 랜덤 행동 결정

    if (monsterAction === "attack") {
      const { damageDealt, wasCritical } = calculateDamage(monsterState, finalStats); // 몬스터의 데미지 계산
      console.log(damageDealt)
      const newHp = await animateHpChange(finalStats.hp, damageDealt, true); // 플레이어 체력 감소

      setLog((prev) => [
        ...prev,
        `${monsterState.name} → 플레이어 공격! 데미지: ${damageDealt}${wasCritical ? " (크리티컬!)" : ""
        }`,
      ]);

      if (newHp >= 0) {
        setTurn("player"); // 플레이어 턴으로 전환
      }
    } else if (monsterAction === "defense") {
      setLog((prev) => [
        ...prev,
        `${monsterState.name}은 방어를 선택했다! 방어력이 증가합니다.`,
      ]);
      setMonsterState((prev) => ({
        ...prev!,
        defense: prev!.defense + 5, // 방어력 증가
      }));
      setTurn("player");// 플레이어 턴으로 전환
      setmd(true);
    }
  };

  useEffect(() => {
    if (md === false) {
      // monsterState가 null인지 확인 후 상태 업데이트
      setMonsterState((prev) => {
        if (!prev) return null; // prev가 null인 경우 방어 코드 추가
        return {
          ...prev,
          defense: Math.max(prev.defense - 5, 0), // 방어력 감소, 최소값은 0
        };
      });

      // finalStats 상태 업데이트
      setFinalStats((prev) => ({
        ...prev,
        defense: Math.max(prev.defense - 5, 0), // 방어력 감소, 최소값은 0
      }));
    }
  }, [md, pd]);


  return (
    <div className="flex items-center justify-center">
      <div className="h-[100vh] w-[90vh] bg-black flex flex-col items-center">
        <p
          className="text-white text-[1.8vh] self-start m-6 cursor-pointer transition-all duration-300  hover:text-[2vh]"
          onClick={() => router.push("/lobby")}
        >
          돌아가기
        </p>
        {/* 플레이어 & 몬스터 스탯 박스 */}
        <div className="flex flex-col gap-6">
          {/* 플레이어 스탯 */}
          <div className="border-2 border-gray-600 w-[50vh] h-[14vh] p-4 rounded-lg flex flex-col justify-center">
            <p className="text-white text-xl">{playerName}</p>
            <div className="text-white flex space-x-4">
              <p>레벨: {playerStats.level}</p>
              <p>공격력: {finalStats.attack}</p>
              <p>방어력: {finalStats.defense}</p>
              <p style={{ color: colors.playerHpColor }}>체력: {finalStats.hp}</p>
              <p>치명타: {finalStats.critical}%</p>
            </div>
            <div className="text-white">
              <p style={{ color: colors.expColor }}>
                경험치: {playerStats.exp} / {playerStats.maxExp}
              </p>
            </div>
          </div>
          {/* 몬스터 스탯 */}
          <div className="border-2 border-gray-600 w-[50vh] h-[10vh] p-4 rounded-lg flex flex-col justify-center">
            <p className="text-white text-xl">
              {monsterState ? monsterState.name : "훈련용 허수아비"}
            </p>
            <div className="text-white flex space-x-4 mt-2">
              <p>레벨: {monsterState?.level ?? 1}</p>
              <p>공격력: {monsterState?.attack ?? 1}</p>
              <p>방어력: {monsterState?.defense ?? 1}</p>
              <p style={{ color: colors.hpColor }}>체력: {monsterHp ?? "-"}</p>
              <p>치명타: {monsterState?.critical ?? 1}%</p>
            </div>
          </div>
        </div>
        {/* 로그 박스 */}
        <div
          className="mt-10 text-white text-base h-[30vh] overflow-y-auto w-[70vh] bg-gray-900 p-4 rounded-2xl"
          ref={logRef}
        >
          {log.map((entry, i) => (
            <p key={i}>• {entry}</p>
          ))}
        </div>
        {turn === "player" && (
          <div className="flex flex-row gap-[1vh] mt-[3vh]">
            <div
              className="border-[2px] border-[#FFFFFF] text-[#FFFFFF] w-[20vh] h-[5vh] rounded-[1vh] flex text-center items-center justify-center text-[2vh] gap-[2vh] transition-all duration-300 hover:w-[23vh] cursor-pointer"
              onClick={handleAttack}
            >
              <Image src={attack} alt="공격" width={20} height={20} />
              공격
            </div>
            <div
              className="border-[2px] border-[#FFFFFF] text-[#FFFFFF] w-[20vh] h-[5vh] rounded-[1vh] flex text-center items-center justify-center text-[2vh] gap-[2vh] transition-all duration-300 hover:w-[23vh] cursor-pointer"
              onClick={handleDefense}
            >
              <Image src={defense} alt="방어" width={16} height={16} />
              방어
            </div>
            <div
              className="border-[2px] border-[#FFFFFF] text-[#FFFFFF] w-[20vh] h-[5vh] rounded-[1vh] flex text-center items-center justify-center text-[2vh] gap-[2vh] transition-all duration-300 hover:w-[23vh] cursor-pointer"
              onClick={handleRun}
            >
              <Image src={run} alt="도망" width={18} height={18} />
              도망
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
