"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue } from "recoil";
import { teamIdentifierState, usernameState, isCreatorState } from "@/app/states";
import styles from "../../join_members/Page.module.css";
import { supabase, updateTeamStatus } from "@/app/lib/supabase";

const GameStartButton: React.FC = () => {
  const router = useRouter();
  const teamIdentifier = useRecoilValue(teamIdentifierState);
  const username = useRecoilValue(usernameState);
  const isCreator = useRecoilValue(isCreatorState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!teamIdentifier) return;
    console.log("teamIdentifier", teamIdentifier);
    const stautsSubscription = supabase
      .channel(`team_status_${teamIdentifier}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Teams",
          filter: `team_id=eq.${teamIdentifier}`,
        },
        (payload) => {
          console.log("payload status", payload.new.status);
          if (payload.new.status === "started") {
            router.push(`/answer`);
          }
        }
      )
      .subscribe();
    console.log("subscription", stautsSubscription);
    // クリーンアップ関数
    return () => {
      stautsSubscription.unsubscribe();
    };

    // const roomRef = doc(db, "rooms", teamIdentifier);
    // const unsubscribe = onSnapshot(roomRef, (docSnapshot) => {
    //   const data = docSnapshot.data();
    //   if (data && data.status === "started") {
    //     router.push(`/answer`);
    //   }
    // });

    // return () => unsubscribe();
  }, [teamIdentifier, router]);

  const handleClick = async () => {
    if (!teamIdentifier || !username || !isCreator) {
      if (!isCreator) {
        window.alert("部屋の作成者のみがゲームを開始できます");
      }
      return;
    }

    setIsLoading(true);

    try {
      // const roomRef = doc(db, "rooms", teamIdentifier);
      // await updateDoc(roomRef, { status: "started" });
      //ここでsupabaseのstatusをstartedにする。
      await updateTeamStatus(teamIdentifier, "started");
    } catch (err) {
      console.error("ゲームの開始に失敗しました", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isCreator) {
    return null;
  }

  return (
    <button className={styles.button} onClick={handleClick} disabled={isLoading}>
      {isLoading ? "開始中..." : "ゲームを開始"}
    </button>
  );
};

export default GameStartButton;
