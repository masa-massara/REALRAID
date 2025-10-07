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
    if (!teamIdentifier) return;
    const fetchMembers = async (teamId: string) => {
      const members = await getMembers(teamId);
      if (Array.isArray(members)) {
        setUserList(members);
      }
    };

    fetchMembers(teamIdentifier);
  }, [teamIdentifier, setUserList]);

  useEffect(() => {
    if (!teamIdentifier) return;
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
          const members = (payload.new as { members?: unknown })?.members;
          if (Array.isArray(members)) {
            setUserList(members as string[]);
          }
        }
      )
      .subscribe();

    return () => {
      memberSubscription.unsubscribe();
    };
  }, [teamIdentifier, setUserList]);

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
