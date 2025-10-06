"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  teamIdentifierState,
  usernameState,
  isCreatorState,
  userIdState,
  userListState,
} from "@/app/states";
import { teamnameState } from "@/app/states";
import styles from "../../room_create/Page.module.css";
import { insertTeamInfo } from "@/app/lib/supabase";
import { validateTeamIdentifier } from "@/app/lib/teamIdentifier";

const CreateRoomButton = () => {
  const router = useRouter();
  const teamIdentifier = useRecoilValue(teamIdentifierState);
  const username = useRecoilValue(usernameState);
  const [error, setError] = useState<string | null>(null);
  const [, setIsCreator] = useRecoilState(isCreatorState);
  const teamname = useRecoilValue(teamnameState);
  const host_id = useRecoilValue(userIdState);
  const [userList, setUserList] = useRecoilState<string[]>(userListState);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const identifierError = validateTeamIdentifier(teamIdentifier);

    if (!teamIdentifier || identifierError || !username) {
      setError(
        identifierError ?? "チーム名（識別子）とユーザー名を入力してください"
      );
      return;
    }

    setIsLoading(true);

    try {
      await insertTeamInfo(
        teamIdentifier,
        host_id,
        teamname,
        username,
        "waiting"
      );
      setIsCreator(true); // 作成者として設定
      const hostList = [username];
      setUserList(hostList);
      router.push(`join_members`);
    } catch (err) {
      console.log("部屋の作成に失敗しました", err);
      setError(
        "部屋の作成に失敗しました。同じチーム名（識別子）が既に使われている可能性があります。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.button}>
      {error && <p className={styles.error}>{error}</p>}
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? "作成中..." : "部屋を作成"}
      </button>
    </div>
  );
};

export default CreateRoomButton;
