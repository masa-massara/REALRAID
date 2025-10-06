"use client";
import React, { useEffect } from "react";
import styles from "../../join_members/Page.module.css";
import { useRecoilState, useRecoilValue } from "recoil";
import { userListState } from "@/app/states";
import { teamIdentifierState } from "@/app/states";
import { supabase, getMembers } from "@/app/lib/supabase";

const UserList: React.FC = () => {
  const [userList, setUserList] = useRecoilState<string[]>(userListState);
  const teamIdentifier = useRecoilValue(teamIdentifierState);

  useEffect(() => {
    // 非同期でgetMembers関数を呼び出し
    const fetchMembers = async (team_id: string) => {
      const members = await getMembers(team_id);
      if (members) {
        setUserList(members);
      }
    };

    fetchMembers(teamIdentifier);
  }, [teamIdentifier]);

  useEffect(() => {
    console.log("teamIdentifier", teamIdentifier);
    const memberSubscription = supabase
      .channel(`team_members_${teamIdentifier}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Teams",
          filter: `team_id=eq.${teamIdentifier}`,
        },
        (payload) => {
          console.log("payload member", payload.new.members);
          setUserList(payload.new.members);
        }
      )
      .subscribe();
    console.log("subscription", memberSubscription);
    // クリーンアップ関数
    return () => {
      memberSubscription.unsubscribe();
    };
  }, [teamIdentifier]);

  console.log(userList);

  return (
    <div>
      {userList.map((user, index) => {
        return (
          <div className={styles.username} key={index}>
            {user}
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
