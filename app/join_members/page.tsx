import React from "react";
import styles from "./Page.module.css";
import UserList from "../ui/components/UserList";
import GameStartButton from "../ui/components/GameStartButton";

const page = () => {
  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <h1 className={styles.h1}>参加者一覧</h1>
        <UserList />
        <GameStartButton />
      </div>
    </div>
  );
};

export default page;
