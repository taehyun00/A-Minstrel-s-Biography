"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

export default function Home() {
  const router = useRouter();
  var level = 0;

  useEffect(() => {
    sessionStorage.setItem("level", "0");
  }, []);

  function Fild() {
    router.push("/Fild");
  }

  function newFild() {
    router.push("/Signup");
  }
  return (
    <div className="flex items-center justify-center">
      <div className="h-[100vh] w-[80vh] bg-[#000000] flex justify-center items-center flex-col ">
        <p className="text-[#FFFFFF] text-[8vh] ">모험가 이야기</p>

        <button className="text-[#FFFFFF] text-[5vh] transition-all duration-300 hover:text-[6vh]" onClick={() => Fild()}>이어서 하기</button>
        <button className="text-[#FFFFFF] text-[5vh] transition-all duration-300 hover:text-[6vh]" onClick={() => newFild()}>새로 시작하기</button>
      </div>
    </div>
  );
}
