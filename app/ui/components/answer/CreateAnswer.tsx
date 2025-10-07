"use client";
import React, { useEffect, useState } from "react";
import {
	DndContext,
	rectIntersection,
	TouchSensor,
	MouseSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import AnswerColumn from "./AnswerColumn";
import UsableCharacterColumn from "./UsableCharacterColumn";
import { useRecoilState, useRecoilValue } from "recoil";
import {
	allAnswerState,
	teamIdentifierState,
	userListState,
	correctCountState,
} from "@/app/states";
import { useRouter } from "next/navigation";
import Timer from "../Timer";

import styles from "../../../answer/Page.module.css";

import {
	getCorrectList,
	updateCorrectDB,
	updateCorrectList,
	supabase,
} from "@/app/lib/supabase";

// アイテムの型定義
type Item = {
	id: string;
	content: string;
};

const CreateAnswer = () => {
	// 状態管理用のフック
	const [usableCharacters, setUsableCharacters] = useState<Item[]>([]);
	const [usableItems, setUsableItems] = useState<Item[]>([]);
	const [answerItems, setAnswerItems] = useState<Item[]>([]);
	const [error, setError] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [lastMeaning, setLastMeaning] = useState<{ word: string; meaning: string } | null>(null);
	const [allAnswer, setAllAnswer] = useRecoilState(allAnswerState);
	const [isCorrect, setIsCorrect] = useState<boolean>(false);
	const [correctCountRecoil, setCorrectCountRecoil] = useRecoilState(correctCountState);

	const teamIdentifier = useRecoilValue(teamIdentifierState);
	const userList = useRecoilValue(userListState);

	useEffect(() => {
		setUsableItems(usableCharacters);
	}, [usableCharacters]);

	useEffect(() => {
		const names: string[] = [];
		userList.forEach((name: string) => {
			names.push(...name.split(""));
		});
		const characterObj = names.map((character, key) => ({
			id: `usable-${key}`,
			content: character,
		}));
		setUsableCharacters(characterObj);
	}, [userList]);

	useEffect(() => {
		let active = true;
		const loadExistingAnswers = async () => {
			if (!teamIdentifier) return;
			try {
				const existing = await getCorrectList(teamIdentifier);
				if (!active) return;
				if (Array.isArray(existing)) {
					setAllAnswer(existing);
					setCorrectCountRecoil(existing.length);
				} else {
					setAllAnswer([]);
					setCorrectCountRecoil(0);
				}
			} catch (loadError) {
				console.error("正解リストの取得に失敗しました", loadError);
			}
		};

		loadExistingAnswers();
		return () => {
			active = false;
		};
	}, [teamIdentifier, setAllAnswer, setCorrectCountRecoil]);

	useEffect(() => {
		if (!teamIdentifier) return;
		const channel = supabase
			.channel(`team_ranking_${teamIdentifier}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "Teams",
					filter: `team_id=eq.${teamIdentifier}`,
				},
				(payload) => {
					const updated = (payload.new as { correct_list?: unknown })?.correct_list;
					const nextList = Array.isArray(updated)
						? (updated as string[])
						: [];
					setAllAnswer(nextList);
					setCorrectCountRecoil(nextList.length);
				}
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [teamIdentifier, setAllAnswer, setCorrectCountRecoil]);

	const handleSubmit = async () => {
		if (isSubmitting) return;
		const candidate = answerItems.reduce((acc, item) => acc + item.content, "").trim();
		if (!candidate) {
			setError("文字をドラッグして回答を作成してください");
			setLastMeaning(null);
			return;
		}
		if (!teamIdentifier) {
			setError("チーム識別子が見つかりません");
			setLastMeaning(null);
			return;
		}
		if (allAnswer.includes(candidate)) {
			setError("この単語は既に回答済みです");
			setAnswerItems([]);
			setUsableItems(usableCharacters);
			setLastMeaning(null);
			return;
		}

		setIsSubmitting(true);
		setError("");
		setLastMeaning(null);

		try {
			const response = await fetch("/api/validate-word", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ word: candidate }),
			});
			const data = await response.json();
			if (!response.ok || !data?.valid) {
				const reason = data?.reason ?? "この単語は認められませんでした";
				setError(reason);
				return;
			}

			const nextAnswers = [...allAnswer, candidate];
			await updateCorrectList(nextAnswers, teamIdentifier);
			await updateCorrectDB(teamIdentifier);

			setAllAnswer(nextAnswers);
			setCorrectCountRecoil(nextAnswers.length);
			setIsCorrect(true);
			setTimeout(() => setIsCorrect(false), 1000);
			setLastMeaning({ word: candidate, meaning: data.meaning ?? "" });
			setAnswerItems([]);
			setUsableItems(usableCharacters);
		} catch (submitError) {
			console.error("回答の送信に失敗しました", submitError);
			setError(
				submitError instanceof Error
					? submitError.message
					: "回答の送信に失敗しました"
			);
			setLastMeaning(null);
		} finally {
			setIsSubmitting(false);
		}
	};

	// 時間切れの状態管理とルーターの設定
	const router = useRouter();

	// 時間切れ時の処理
	const handleTimeUp = () => {
		router.push("/result");
	};

	const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

	// ドラッグ終了時の処理
	const handleDragEnd = (event: { active: any; over: any }) => {
		const { active, over } = event;

		// ドラッグしたアイテムが使用可能なアイテムかつ回答列にドロップされた場合
		if (active.data.current?.type === "usable-item" && over && over.id === "answer-column") {
			if (!answerItems.find((item) => item.id === active.id)) {
				setAnswerItems((items) => [
					...items,
					{ id: active.id, content: active.data.current.content },
				]);
				setUsableItems((items) => items.filter((item) => item.id !== active.id));
			}
		} else if (over && active.id !== over.id) {
			const oldIndex = answerItems.findIndex((item) => item.id === active.id);
			const newIndex = answerItems.findIndex((item) => item.id === over.id);
			setAnswerItems((items) => arrayMove(items, oldIndex, newIndex));
		} else if (!over) {
			const item = answerItems.find((item) => item.id === active.id);
			if (item) {
				setAnswerItems((items) => items.filter((item) => item.id !== active.id));
				setUsableItems((items) =>
					[...items, item].sort(
						(a, b) =>
							usableCharacters.findIndex((fixedItem) => fixedItem.id === a.id) -
							usableCharacters.findIndex((fixedItem) => fixedItem.id === b.id)
					)
				);
			}
		}
	};

	return (
		<DndContext
			sensors={sensors}
			onDragEnd={handleDragEnd}
			collisionDetection={rectIntersection}
		>
			<div className={styles.wrapper}>
				<div className={styles.panel}>
					<div className={styles.timerRow}>
						<Timer onTimeUp={handleTimeUp} />
					</div>
					<div
						className={`${styles.correctToast} ${
							isCorrect ? styles.correctToastVisible : ""
						}`}
					>
						正解！
					</div>
					<div
						className={`${styles.answerArea} ${
							isCorrect ? styles.answerAreaCorrect : ""
						}`}
					>
						<AnswerColumn
							id="answer-column"
							items={answerItems}
							setItems={setAnswerItems}
						/>
					</div>
					<div className={styles.lettersSection}>
						<p className={styles.helperText}>
							文字をドラッグして並べ替え、ことばを作ろう！
						</p>
						<UsableCharacterColumn items={usableItems} />
					</div>
					<div className={styles.footer}>
						<button
							onClick={handleSubmit}
							className={styles.submitButton}
							disabled={answerItems.length === 0 || isSubmitting}
						>
							{isSubmitting ? "判定中..." : "回答を送信"}
						</button>
						<div className={styles.correctBadge}>
							<span className={styles.correctLabel}>正解数</span>
							<span className={styles.correctValue}>{correctCountRecoil}</span>
						</div>
					</div>
					{error && <p className={styles.error}>{error}</p>}
					{lastMeaning && !error && (
						<div className={styles.meaningCard}>
							<p className={styles.meaningWord}>{lastMeaning.word}</p>
							<p className={styles.meaningText}>
								{lastMeaning.meaning || "意味の説明は取得できませんでした"}
							</p>
						</div>
					)}
				</div>
			</div>
		</DndContext>
	);
};

export default CreateAnswer;
