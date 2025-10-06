"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { teamIdentifierState, usernameState, isCreatorState } from "@/app/states";
import { addMemberToTeam } from "@/app/lib/supabase";
import { validateTeamIdentifier } from "@/app/lib/teamIdentifier";
import styles from "../../room_join/Page.module.css";

const JoinRoomButton: React.FC = () => {
  const router = useRouter();
  const teamIdentifier = useRecoilValue(teamIdentifierState);
  const username = useRecoilValue(usernameState);
  const setIsCreator = useSetRecoilState(isCreatorState);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    const identifierError = validateTeamIdentifier(teamIdentifier);

    if (!teamIdentifier || identifierError || !username) {
      setError(
        identifierError ?? "チーム名（識別子）とユーザー名を入力してください"
      );
      return;
    }

    try {
      await addMemberToTeam(teamIdentifier, username);
      setIsCreator(false); // 参加者として設定
      router.push(`join_members`);
    } catch (err) {
      console.error("部屋の参加に失敗しました", err);
      setError(
        "部屋の参加に失敗しました。チーム名（識別子）を確認してください。"
      );
    }
  };

  return (
    <div>
      {error && <p className={styles.error}>{error}</p>}
      <button onClick={handleClick} className="button_middle_background">
        <div className="button_middle_front">部屋に参加</div>
      </button>
    </div>
  );
};

export default JoinRoomButton;
