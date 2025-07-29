"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../suparbase"
import React from "react";

export default function Home() {
  const router = useRouter();
  const [name, setname] = useState("");
  const [password, setpassword] = useState("");
  const [IsOk, setIsok] = useState(false);

  function gameStart(names: string, password: string) {
    if (names.length == 0 || password.length == 0) {
      if (IsOk == true) {
        return
      }
      else {
        setIsok(!IsOk)
      }
    }
    else {
      if (IsOk == true) {
        setIsok(!IsOk)
      }
      else {
        Insertplayer()
      }
    }


  }

  async function Insertplayer() {

    const { data, error: selectError } = await supabase
      .from('player')
      .select('password,level')
      .eq('playername', name);

    if (selectError) {
      console.error("ID 가져오기 실패:", selectError);
      return;
    }
    if (data[0].password == password) {
      alert("로그인 성공!")
      const level = data[0].level
      localStorage.setItem('name', name);
      localStorage.setItem('level', level.toString());
      router.push("/lobby")

    }
    else if (data[0].password != password) {
      alert("로그인 실패")
    }


  }

  function backhome() {
    router.push("/");
  }

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="h-[100vh] w-[90vh] bg-[#000000] flex justify-center items-center flex-col gap-[5vh] ">
        <p className="text-[#FFFFFF] text-[1.8vh] relative top-[-30vh] mr-[56vh] transition-all duration-300 hover:text-[2vh]" onClick={() => backhome()}>돌아가기</p>
        <p className="text-[#FFFFFF] text-[4vh] ">이름과 비밀번호를 입력해주세요</p>

        <input type="text" className="border-b-[2px] border-[#FFFFFF] text-[#FFFFFF] text-center outline-none w-[20vh] transition-all duration-300 focus:w-[30vh]" placeholder="이름을 입력해주세요"
          value={name}
          onChange={(e) => setname(e.target.value)}
        />

        <input type="text" className="border-b-[2px] border-[#FFFFFF] text-[#FFFFFF] text-center outline-none w-[20vh] transition-all duration-300 focus:w-[30vh]" placeholder="비밀번호를 입력해주세요"
          value={password}
          onChange={(p) => setpassword(p.target.value)}
        />
        {IsOk ? <span className="text-[#ED0000]">비밀번호와 이름을 입력해주세요!</span> : <></>}

      </div>

      <p className="text-[#FFFFFF] text-center relative top-[-30vh]  transition-all duration-300 hover:text-[2vh]" onClick={() => gameStart(name, password)}>로그인</p>
    </div>
  );
}
