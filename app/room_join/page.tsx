import React from "react";
import styles from "./Page.module.css";
import JoinRoomButton from "../ui/components/JoinRoomButton";
import TeamIdentifierInput from "../ui/components/TeamIdentifierInput";

const page = () => {
	return (
		<div className={styles.container}>
			<div className={styles.background_large}>
				<h1 className={styles.h1}>部屋に参加</h1>
				<p className={styles.p}>
					ホストから共有されたチーム名を入力すると自動で識別コードが生成されます。
					識別コードをそのまま入力してもOKです。
				</p>
				<TeamIdentifierInput
					placeholder="チーム名または識別コード"
					inputClassName={styles.input}
					errorClassName={styles.error}
				/>
				<JoinRoomButton />
			</div>
		</div>
	);
};

export default page;
