"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

export default function Fild() {
    const router = useRouter();

    const name = sessionStorage.getItem("username");
    const level = Number(sessionStorage.getItem("level"));
    const [copylevel,setlevel] = useState(0);

    useEffect(()=>{
        sessionStorage.setItem("level",copylevel.toString());
    },[copylevel])



    function backhome() {
        router.push("/");
      }


  return (
    <div className="flex items-center justify-center ">
      <div className="h-[100vh] w-[90vh] bg-[#000000] flex justify-center items-center flex-col">
      <p className="text-[#FFFFFF] text-[1.8vh] relative top-[-30vh] mr-[56vh] transition-all duration-300 hover:text-[2vh]" onClick={()=> backhome()}>돌아가기</p>
        <div className="text-start">
        <p className="text-[#FFFFFF] text-[1.8vh] relative top-[-30vh] mr-[50vh]">닉네임 : {name}</p>
        <p className="text-[#FFFFFF] text-[1.8vh] relative top-[-30vh] mr-[50vh]">레벨 : {level}</p>
        </div>
        <p onClick={() => setlevel(copylevel+1)} className="text-[#FFFFFF] text-[1.8vh]">레벨업</p>
      </div>

    </div>
  );
}
