"use client";

import { useRouter } from "next/navigation";
import { useEffect , useState} from "react";
import React from "react";

export default function Fild() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [level, setLevel] = useState("");

    useEffect(() => {
      const name = localStorage.getItem("name");
      const level = localStorage.getItem("level");

      if (name) setName(name);
      if (level) setLevel(level);

    }, []);


    function backhome() {
        router.push("/");
      }

      function Adv() {
        router.push("/adventure");
      }
      function Eq() {
        router.push("/equipment");
      }
      function Tl() {
        router.push("/Trial");
      }


  return (
    <div className="flex items-center justify-center flex-col">
      <div className="h-[100vh] w-[90vh] bg-[#000000] flex justify-center items-center flex-col ">
        <p className="text-[#FFFFFF] text-[1.8vh] relative top-[-30vh] mr-[56vh] transition-all duration-300 hover:text-[2vh]" onClick={()=> backhome()}>돌아가기</p>


        <div className="text-center">
        <p className="text-[#FFFFFF] text-[2vh] relative top-[-20vh] ">당신</p>
        <p className="text-[#FFFFFF] text-[2vh] relative top-[-20vh] ">이름 : {name}</p>
        <p className="text-[#FFFFFF] text-[2vh] relative top-[-20vh] ">레벨 : {level}</p>
        </div>
        <br  className="border-b-[2px] border-[#FFFFFF]"/>
        <div className="text-center">
        <p className="text-[#FFFFFF] text-[2vh] relative top-[-20vh] ">당신의 눈앞에는 커다란 성채가 보입니다.</p>
        <p className="text-[#FFFFFF] text-[2vh] relative top-[-20vh]">그 아래 마을이 형성되어있고 들릴수있는곳이 보이는군요,</p>
        <p className="text-[#FFFFFF] text-[2vh] relative top-[-20vh] ">무엇을 하시겠습니까?</p>
        <br />
        </div>
      </div>

      <div className="relative top-[-20vh] flex flex-row gap-[5vh]">
        <p className="text-[#FFFFFF] text-[1.7vh] transition-all duration-300  hover:text-[2vh]" onClick={() => Adv()}>모험</p>
        <p className="text-[#FFFFFF] text-[1.7vh] transition-all duration-300  hover:text-[2vh]" onClick={() => Eq()}>장비</p>
        <p className="text-[#FFFFFF] text-[1.7vh] transition-all duration-300  hover:text-[2vh]" onClick={() => Tl()}>시련</p>

      </div>
    </div>
  );
}
