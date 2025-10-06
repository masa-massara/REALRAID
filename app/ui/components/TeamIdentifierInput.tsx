"use client";
import React, { useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { teamIdentifierState, teamnameState } from "@/app/states";
import {
  generateTeamIdentifier,
  validateTeamIdentifier,
} from "@/app/lib/teamIdentifier";

type Props = {
  label?: string;
  placeholder?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperText?: string;
};

const TeamIdentifierInput: React.FC<Props> = ({
  label,
  placeholder = "チーム名",
  inputClassName,
  errorClassName,
  helperText,
}) => {
  const [teamname, setTeamname] = useRecoilState(teamnameState);
  const setTeamIdentifier = useSetRecoilState(teamIdentifierState);
  const [identifierError, setIdentifierError] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setTeamname(value);
    const nextIdentifier = generateTeamIdentifier(value);
    setTeamIdentifier(nextIdentifier);
    setIdentifierError(validateTeamIdentifier(nextIdentifier));
  };

  return (
    <div>
      {label && <label>{label}</label>}
      <input
        type="text"
        value={teamname}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
      {helperText && <p>{helperText}</p>}
      {identifierError && (
        <p className={errorClassName}>{identifierError}</p>
      )}
    </div>
  );
};

export default TeamIdentifierInput;
