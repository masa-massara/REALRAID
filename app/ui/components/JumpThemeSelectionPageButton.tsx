"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  teamIdentifierState,
  teamnameState,
  usernameState,
  isCreatorState,
} from "@/app/states";
import styles from "../../join_members/Page.module.css";
import { supabase, updateTeamStatus } from "@/app/lib/supabase";
import { generateTeamIdentifier } from "@/app/lib/teamIdentifier";

const JumpThemeSelectionPageButton: React.FC = () => {
  const router = useRouter();
  const teamname = useRecoilValue(teamnameState);
  const teamIdentifierStateValue = useRecoilValue(teamIdentifierState);
  const username = useRecoilValue(usernameState);
  const isCreator = useRecoilValue(isCreatorState);
  const setTeamIdentifier = useSetRecoilState(teamIdentifierState);

  const teamIdentifier = teamIdentifierStateValue || generateTeamIdentifier(teamname);

  useEffect(() => {
    if (!teamIdentifier) return;
    if (!teamIdentifierStateValue && teamIdentifier) {
      setTeamIdentifier(teamIdentifier);
    }
    console.log("[JumpThemeSelection] subscribe", {
      teamIdentifier,
      teamIdentifierStateValue,
      teamname,
    });
    const stautsSubscription = supabase
      .channel(`team_game_start_${teamIdentifier}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Teams",
          filter: `team_id=eq.${teamIdentifier}`,
        },
        (payload) => {
          console.log("[JumpThemeSelection] realtime payload", {
            status: payload.new.status,
            teamIdentifier,
          });
          if (payload.new.status === "thinking_theme") {
            router.push(`/theme_selection_page`);
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
  }, [teamIdentifier, router, setTeamIdentifier, teamIdentifierStateValue, teamname]);

  const handleClick = async () => {
    console.log("[JumpThemeSelection] handleClick", {
      teamIdentifier,
      username,
      isCreator,
    });
    if (!teamIdentifier || !username || !isCreator) {
      console.warn("[JumpThemeSelection] blocked", {
        reason: !teamIdentifier
          ? "missing teamIdentifier"
          : !username
          ? "missing username"
          : "not creator",
        teamIdentifier,
        username,
        isCreator,
      });
      if (!isCreator) {
        window.alert("部屋の作成者のみがゲームを開始できます");
      }
      return;
    }

    try {
      console.log("[JumpThemeSelection] updateTeamStatus -> thinking_theme", {
        teamIdentifier,
      });
      await updateTeamStatus(teamIdentifier, "thinking_theme");
      console.log("[JumpThemeSelection] updateTeamStatus finished");
    } catch (err) {
      console.error(
        "[JumpThemeSelection] failed to update team status",
        err
      );
    }
  };

  if (!isCreator) {
    return null;
  }

  return (
    <button className={styles.button} onClick={handleClick}>
      {" "}
      問題テーマの設定をしよう！
    </button>
  );
};

export default JumpThemeSelectionPageButton;
