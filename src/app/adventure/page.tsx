"use client";

import { supabase } from "../../../suparbase";
import { useRouter } from "next/navigation";
import React, { useEffect, useState ,useRef } from "react";
import attack from "../images/attack.svg";
import defense from "../images/defense.svg";
import run from "../images/run.svg";
import Image from "next/image";
import { calculateDamage, Stats } from "../utils/attack";


export default function Adventure() {
  const logRef = useRef<HTMLDivElement>(null);
  const [playername, setPlayername] = useState<string | null>(null);
  const [turn,setturn] = useState<"player" | "monster">("player")
  const [monserdefense , setmd] = useState(false);
  const [playerdefense , setpd] = useState(false);
  const [MYstats, setMYStats] = useState({ attack: 0, defense: 0, critical: 0 });
  const [stats, setStats] = useState({ attack: 0, defense: 0, hp: 0, critical: 0 });
  const [playerStats, setPlayerStats] = useState({
    level :0,
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
    exp : number;
  } | null>(null);

  const [monsterHp, setMonsterHp] = useState<number | null>(null);
  const [hpColor, setHpColor] = useState<string>("white");
  const [PhpColor, setPhpColor] = useState<string>("white");
  const [expColor, setExpColor] = useState<string>("white");


  const [log, setLog] = useState<string[]>([
    "어두운 눈앞이 밝아지고 끝없이 이어진 길을 따라갔다.",
  ]);
  const [hasFetchedPlayer, setHasFetchedPlayer] = useState(false);
  const router = useRouter();

  // 1) 로컬스토리지에서 name, level 불러오기
  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) setPlayername(storedName);
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  // 2) playername이 세팅된 이후에만 플레이어 기본 스탯 fetch
  useEffect(() => {
    if (!playername || hasFetchedPlayer) return;

    const fetchPlayerStats = async () => {
      const { data, error } = await supabase
        .from("player")
        .select("level,attack, defense, hp, critical, exp, maxexp")
        .eq("playername", playername); // 실제 컬럼명 확인!

      if (error) {
        console.error("플레이어 fetch 에러:", error);
      } else if (data && data.length > 0) {
        // 첫 번째 레코드만 사용
        const entry = data[0];
        setPlayerStats({
          level : entry.level,
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
  }, [playername, hasFetchedPlayer,playerStats]);

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
        .lte("level", playerStats.level + 5);

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
    let finalHp = Math.max((monsterHp ?? 0) - damage, 0);
    setMonsterHp(finalHp);
    for (let i = 0; i < damage; i++) {
      if(finalHp == 0 ){
        break;
      }
      finalHp = Math.max(finalHp - 1, 0);
      setMonsterHp(finalHp);
      setHpColor("red");
      await new Promise(res => setTimeout(res,50));
    }
    
    setHpColor("white");
    return finalHp;
  }

  

  async function PlayeranimateHpDecrease(damage: number): Promise<number> {
    let finalHp = playerStats.hp + stats.hp ?? 0;
    for (let i = 0; i < damage; i++) {
      if(finalHp == 0 ){
        break;
      }
      finalHp = Math.max(finalHp - 1, 0);
      setPlayerStats(prev => ({
        ...prev,
        hp: finalHp,
      }));
      setPhpColor("red");
      await new Promise(res => setTimeout(res, 50));
    }
    setPhpColor("white");
    return finalHp;
  }

  async function animateExpIncrease(current: number, target: number) {
    for (let i = current + 1; i <= target; i++) {
      setPlayerStats(prev => ({ ...prev, exp: i }));
      setExpColor("yellow");
      await new Promise(res => setTimeout(res, 100));
    }
    setExpColor("white");
  }

  async function levelup(getexp: number) {
    let newExp = playerStats.exp + getexp;
    let newLevel = playerStats.level;
    let remainingExp = newExp;
    let newMaxExp = playerStats.maxexp;
    let newAttack = playerStats.attack;
    let newDefense = playerStats.defense;
    let newHp = playerStats.hp;
    await animateExpIncrease(playerStats.exp, newExp);
    while (remainingExp >= newMaxExp) {
      remainingExp -= newMaxExp;
      newLevel++;
      newMaxExp = Math.floor(newMaxExp * 1.2);
      newAttack++;
      newDefense++;
      newHp++;
    }
    
    await supabase
      .from("player")
      .update({
        exp: remainingExp,
        maxexp: newMaxExp,
        level: newLevel,
        attack: newAttack,
        defense: newDefense,
        hp: newHp,
      })
      .eq("playername", playername);

    setPlayerStats(prev => ({
      ...prev,
      exp: remainingExp,
      maxexp: newMaxExp,
      attack: newAttack,
      defense: newDefense,
      hp: newHp,
      level : newLevel}));

  }
  async function monsterAction(){
    setmd(false);
    let pd = 0;
    const action = Math.random() * 101;
    if (!monsterState || monsterHp === null) return;
    if(playerdefense){
      pd =  playerStats.defense + MYstats.defense * 2;

    }
    else{
      pd = playerStats.defense + MYstats.defense;
    }

    const monsterStats: Stats = {
      attack: monsterState.attack,
      defense: monsterState.defense,
      critical: monsterState.critical,
    };
    const PlayerStats: Stats = {
      attack: playerStats.attack + MYstats.attack,
      defense: pd,
      critical: playerStats.critical + MYstats.critical
    };

    
    
    const { damageDealt, wasCritical } = calculateDamage(monsterStats, PlayerStats);

    if(action <= 40){
      setLog(prev => [...prev, `${monsterState.name}은 견고하게 자세를 취했다. 방어력X2`]);
      setmd(!monserdefense);
    }
    else if(action > 40){
      setLog(prev => [...prev, `${monsterState.name}은 공격을 하기 위해 준비하고있다!`]);
      setLog(prev => [...prev, `${monsterState.name} → ${playername} 공격! 데미지 : ${damageDealt}${wasCritical ? " (크리티컬!)" : ""}`]);
      const playerHp = await PlayeranimateHpDecrease(damageDealt);

      const { data: eq, error: eqErr } = await supabase
        .from("player")
        .update({ hp: playerHp })
        .eq("playername", playername);

      if(playerHp == 0){

      }

    }

    setTimeout(() => setturn("player"), 50);
    console.log(turn)
  }

  async function handleAttack() {
    setpd(false);
    let md = 0;
    console.log(turn)
    setturn("monster");
    if (!monsterState || monsterHp === null) return;
    if(monserdefense){
      md =  monsterState.defense * 2;
      
    }
    else{
      md = monsterState.defense;
    }
    const monsterStats: Stats = {
      
      attack: monsterState.attack,
      defense: md,
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
  ` `
    if (finalHp <= 0) {
      setLog(prev => [...prev, `${monsterState.name}를 물리쳤다! exp ${monsterState.exp}를 획득했다.`]);
      if (monsterState.exp) {
        await levelup(monsterState.exp);
      }
      gaka();
  
    }
    setTimeout(() => monsterAction(), 50);
  }

  async function handleDefense() {
    setLog(prev => [...prev, `${playername}은 견고하게 자세를 취했다. 방어력X2`]);
    setmd(!playerdefense);
    setTimeout(() => monsterAction(), 50);
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
          <div className="border-2 border-gray-600 w-[50vh] h-[14vh] p-4 rounded-lg flex flex-col justify-center">
            <p className="text-white text-xl">{playername}</p>
            <div className="text-white flex space-x-4">
              <p>레벨: {playerStats.level}</p>
              <p>공격력: {stats.attack + playerStats.attack}</p>
              <p>방어력: {stats.defense + playerStats.defense}</p>
              <p style={{color : PhpColor}}>체력: {stats.hp + playerStats.hp}</p>
              <p>치명타: {stats.critical + playerStats.critical}%</p>
            </div>
            <div className="text-white">
              <p style={{color : expColor}}>exp:{playerStats.exp} / {playerStats.maxexp} </p>
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
        <div className="mt-10 text-white text-base h-[30vh] overflow-y-auto w-[70vh] bg-gray-900 p-4 rounded-2xl" ref={logRef}>
          {log.map((entry, i) => (
            <p key={i}>• {entry}</p>
          ))}
        </div>

        {turn == "player" ? <div className="flex flex-row gap-[1vh] mt-[3vh]">
          <div className="border-[2px] border-[#FFFFFF] text-[#FFFFFF] w-[20vh] h-[5vh] rounded-[1vh] flex text-center items-center justify-center text-[2vh] gap-[2vh] transition-all duration-300 hover:w-[23vh]  cursor-pointer" onClick={()=> {handleAttack()}}><Image src={attack} alt="공격" width={20} height={20}/>공격</div>
          <div className="border-[2px] border-[#FFFFFF] text-[#FFFFFF] w-[20vh] h-[5vh] rounded-[1vh] flex text-center items-center justify-center text-[2vh] gap-[2vh] transition-all duration-300 hover:w-[23vh] cursor-pointer" onClick={()=> {handleDefense()}}><Image src={defense} alt="공격" width={16} height={16}/>방어</div>
          <div className="border-[2px] border-[#FFFFFF] text-[#FFFFFF] w-[20vh] h-[5vh] rounded-[1vh] flex text-center items-center justify-center text-[2vh] gap-[2vh] transition-all duration-300 hover:w-[23vh] cursor-pointer"><Image src={run} alt="공격" width={18} height={18}/>도망</div>
        </div> : <></> }
        
        </div>
      </div>
  );
}
