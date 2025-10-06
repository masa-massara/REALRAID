"use client";
import React, { useState, useEffect } from "react";
import styles from "../../../register/Page.module.css";
import { useRecoilState, useSetRecoilState } from "recoil";
import { teamIdentifierState, teamnameState } from "../../../states";
import {
	generateTeamIdentifier,
	validateTeamIdentifier,
} from "@/app/lib/teamIdentifier";
import { supabase } from "@/app/lib/supabase";

const InputTeamname = () => {
	const [teamname, setTeamname] = useRecoilState<string>(teamnameState);
	const setTeamIdentifier = useSetRecoilState(teamIdentifierState);
	const [identifierError, setIdentifierError] = useState<string | null>(null);
	const [duplicateError, setDuplicateError] = useState<string | null>(null);

	useEffect(() => {
		const checkTeamname = async () => {
			if (teamname) {
				const { data, error } = await supabase
					.from("Teams")
					.select("team_name")
					.eq("team_name", teamname);

				if (error) {
					console.error("Error checking team name:", error);
					return;
				}

				if (data && data.length > 0) {
					setDuplicateError(`チーム名 '${teamname}' は既に使用されています。`);
				} else {
					setDuplicateError(null);
				}
			}
		};

		const timerId = setTimeout(() => {
			checkTeamname();
		}, 500); // 500ms のデバウンス

		return () => {
			clearTimeout(timerId);
		};
	}, [teamname]);

	const handleChange = (value: string) => {
		setTeamname(value);
		const nextIdentifier = generateTeamIdentifier(value);
		setTeamIdentifier(nextIdentifier);
		setIdentifierError(validateTeamIdentifier(nextIdentifier));
	};

	return (
		<div>
			<input
				type="text"
				value={teamname}
				onChange={(e) => handleChange(e.target.value)}
				placeholder="チーム名"
				className={styles.input}
			/>
			{identifierError && (
				<p className={styles.error}>{identifierError}</p>
			)}
			{duplicateError && (
				<p className={styles.error}>{duplicateError}</p>
			)}
		</div>
	);
};

export default InputTeamname;
