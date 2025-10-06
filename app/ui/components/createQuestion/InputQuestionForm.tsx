"use client";
import React, { useState, useEffect } from "react";
import styles from "../../../theme_selection_page/Page.module.css";
import { useRouter } from "next/navigation";
import { useRecoilState, useRecoilValue } from "recoil";
import { teamIdentifierState, usernameState, isCreatorState, themeWordsState } from "@/app/states";
import { supabase, updateCorrectList, updateTeamStatus } from "@/app/lib/supabase";
import { ReturnThemeJSONData } from "@/app/lib/openAI";

const SAMPLE_THEMES = ["どうぶつ", "たべもの", "がっき", "くに"];

const InputQuestionForm: React.FC = () => {
	const [theme, setTheme] = useState("");
	const isCreator = useRecoilValue(isCreatorState);
	const router = useRouter();
	const teamIdentifier = useRecoilValue(teamIdentifierState);
	const username = useRecoilValue(usernameState);
	const [themeWords, setThemeWords] = useRecoilState<string[]>(themeWordsState);
	const [loading, setLoading] = useState(false);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTheme(e.target.value);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log("テーマ:", theme);
		setTheme("");
	};

	useEffect(() => {
		if (!teamIdentifier) return;
		console.log("teamIdentifier", teamIdentifier);
		const stautsSubscription = supabase
			.channel(`team_set_theme_${teamIdentifier}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "Teams",
					filter: `team_id=eq.${teamIdentifier}`,
				},
				(payload) => {
					console.log("payload status", payload.new.status);
					if (payload.new.status === "setTheme") {
						router.push(`/check_theme_and_answer`);
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
	}, [teamIdentifier, router]);

	const handleClick = async () => {
		if (loading) {
			console.log("[InputQuestionForm] skip click while loading");
			return;
		}

		if (!teamIdentifier || !username || !isCreator) {
			if (!isCreator) {
				window.alert("部屋の作成者のみが問題テーマを入力できます");
			}
			return;
		}

		if (!theme) {
			window.alert("お題のテーマを入力してください");
			return;
		}

		try {
			setLoading(true);
			const themeData = await ReturnThemeJSONData(theme);
			if (!themeData) {
				console.error("テーマの取得に失敗しました");
				return;
			}
			console.log("themeData.words", themeData.words);
			setThemeWords(themeData.words);
			await updateCorrectList(themeData.words, teamIdentifier);
			await updateTeamStatus(teamIdentifier, "setTheme");
		} catch (err) {
			console.error("ゲームの開始に失敗しました", err);
		} finally {
			setLoading(false);
		}
	};

	if (!isCreator) {
		return (
			<div>
				<h1>Team作成者と一緒に問題テーマを相談してください。</h1>
			</div>
		);
	}

	return (
		<div>
			<h1>お題テーマを入力</h1>
			<form
				onSubmit={(e) => handleSubmit(e)}
				className="flex flex-col justify-center items-center"
			>
				<input
					type="text"
					value={theme}
					onChange={(e) => handleInputChange(e)}
					placeholder="お題テーマを入力してください"
					className={styles.input}
				/>
				<button
					type="submit"
					className={`${styles.button}${loading ? ` ${styles.buttonDisabled}` : ""}`}
					onClick={handleClick}
					disabled={loading}
				>
					{loading ? "お題を生成しています..." : "決定"}
				</button>
				{loading && <p>お題や正解リストを生成中です。しばらくお待ちください。</p>}
			</form>
			<div className={styles.sampleBlock}>
				<p className={styles.sampleTitle}>お題の例</p>
				<ul className={styles.sampleList}>
					{SAMPLE_THEMES.map((sample) => (
						<li key={sample} className={styles.sampleItem}>
							{sample}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default InputQuestionForm;
