"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSaveUserinFirebase } from "@/app/lib/userhooks";
import { useRecoilState, useRecoilValue } from "recoil";
import {
	canSubmitState,
	roomfullState,
	teamIdentifierState,
	teamnameState,
	instagramIdState,
	twitterIdState,
	usernameState,
	userIdState,
} from "@/app/states";
import { getUserId, insertUserInfo } from "@/app/lib/supabase";
import { validateTeamIdentifier } from "@/app/lib/teamIdentifier";
import { supabase } from "@/app/lib/supabase";

const RegisterButton: React.FC = () => {
	const router = useRouter();
	const saveUser = useSaveUserinFirebase();
	const roomfull = useRecoilValue(roomfullState);
	const [isLoading, setIsLoading] = useState(false);
	const [teamname, setTeamname] = useRecoilState<string>(teamnameState);
	const [username, setUsername] = useRecoilState<string>(usernameState);
	const [canSubmit, setCanSubmit] = useRecoilState<boolean>(canSubmitState);
	const [userId, setUserId] = useRecoilState<string>(userIdState);
	const [instagramId, setInstagramId] =
		useRecoilState<string>(instagramIdState);
	const [twitterId, setTwitterId] = useRecoilState<string>(twitterIdState);
	const teamIdentifier = useRecoilValue(teamIdentifierState);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const identifierError = validateTeamIdentifier(teamIdentifier);
		const canSubmitValue = Boolean(teamname && username && !identifierError);
		setCanSubmit(canSubmitValue);
		if (!canSubmitValue) {
			setError(identifierError ?? "チーム名と名前を入力してください");
		} else {
			setError(null);
		}
	}, [teamname, username, teamIdentifier, setCanSubmit]);

	const handleButtonClick = async (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		e.preventDefault();

		if (!canSubmit) {
			return;
		}
		setError(null);
		setIsLoading(true);

		try {
			const { data: existingTeam, error: checkError } = await supabase
				.from("Teams")
				.select("team_name")
				.eq("team_name", teamname)
				.single();

			if (checkError && checkError.code !== "PGRST116") {
				throw new Error("チーム名の確認中にエラーが発生しました。");
			}

			if (existingTeam) {
				throw new Error(`チーム名 '${teamname}' は既に使用されています。`);
			}

			await insertUserInfo(
				username,
				teamname,
				instagramId,
				twitterId
			);

			const getUserIdErrorAndData = await getUserId(username, teamname);
			if (getUserIdErrorAndData.data && getUserIdErrorAndData.data.length > 0) {
				setUserId(getUserIdErrorAndData.data[0].id);
			} else {
				throw new Error("ユーザーIDの取得に失敗しました。");
			}

			router.push("/room_create_or_join");
		} catch (e: any) {
			console.log(e);
			setError(e.message || "登録中にエラーが発生しました。");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<button
				onClick={handleButtonClick}
				className="button_middle_background"
				disabled={isLoading || !canSubmit}
			>
				<div className="button_middle_front">登録</div>
			</button>
			{isLoading && <p>処理中...</p>}
			{error && <p>{error}</p>}
		</div>
	);
};

export default RegisterButton;
