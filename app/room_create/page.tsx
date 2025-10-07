import React from "react";
import styles from "./Page.module.css";
import TeamIdentifierInput from "../ui/components/TeamIdentifierInput";
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
				<TeamIdentifierInput
					inputClassName={styles.input}
					errorClassName={styles.error}
					helperClassName={styles.helper}
					helperText="チーム名を入力すると共有用の識別コードが自動生成されます"
				/>
			</div>
			<CreateRoomButton />
		</div>
	);
};

export default Page;
