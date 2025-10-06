"use client";
import React from "react";
import { useRecoilValue } from "recoil";
import { teamnameState } from "@/app/states";

const Teamname = () => {
  const teamname = useRecoilValue(teamnameState);
  return <span>{teamname}</span>;
};

export default Teamname;
