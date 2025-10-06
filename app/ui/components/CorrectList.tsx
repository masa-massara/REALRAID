"use client";
import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { teamIdentifierState, themeWordsState } from "@/app/states";
import { getCorrectList } from "@/app/lib/supabase";

const CorrectList: React.FC = () => {
  const [correctWordsList, setCorrectWordsList] =
    useRecoilState(themeWordsState);
  const teamIdentifier = useRecoilValue(teamIdentifierState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const getAndSetCorrectList = async (teamIdentifier: string) => {
      const correctList = await getCorrectList(teamIdentifier);
      if (correctList) {
        setCorrectWordsList(correctList);
      }
    };
    getAndSetCorrectList(teamIdentifier);
    setLoading(false);
  }, [teamIdentifier]);

  return (
    <div>
      {correctWordsList.slice(0, 5).map((correctWord, index) => (
        <div key={index}>{correctWord}</div>
      ))}
      {loading && <p>正解リストを取得中</p>}
    </div>
  );
};

export default CorrectList;
