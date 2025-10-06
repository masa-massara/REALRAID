import React from "react";
import styles from "./Page.module.css";
import Teamname from "../ui/components/Teamname";
import CreateRoomButton from "../ui/components/CreateRoomButton";

const Page = () => {
	return (
		<div className={styles.container}>
			<h1 className={styles.h1}>部屋の作成</h1>
			<p className={styles.description}>
				登録したチーム名がそのまま部屋の識別子になります。
				仲間に共有して同じチーム名で参加してもらいましょう。
			</p>
			<div className={styles.teamInfo}>
				<h2 className={styles.sectionTitle}>チーム名</h2>
				<p className={styles.teamNameValue}>
					<Teamname />
				</p>
			</div>
			<CreateRoomButton />
		</div>
	);
};

export default Page;
