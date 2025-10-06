"use client";
import React, { useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import styles from "./HelpButton.module.css";

const HelpButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleHelp = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button className={styles.helpButton} onClick={toggleHelp} aria-label="ヘルプ">
        <FaQuestionCircle size={32} />
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={toggleHelp}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={toggleHelp}>
              ×
            </button>
            <h2 className={styles.modalTitle}>文字もじ とは？</h2>
            <div className={styles.modalBody}>
              <p className={styles.description}>
                <strong>「文字もじ」</strong>は、初めましての場をもっと楽しく！チーム対戦型の言葉作りゲームです。
              </p>
              
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>🎯 ゲームの目的</h3>
                <p>
                  仲間と協力して、散らばった文字を集めて言葉を作ろう！
                  制限時間内にできるだけ多くの言葉を見つけて、チームで高得点を目指します。
                </p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>👥 こんな場面で</h3>
                <ul className={styles.list}>
                  <li>初めて会う人たちとのアイスブレイク</li>
                  <li>チームビルディングのきっかけ作り</li>
                  <li>オンライン・オフラインの交流イベント</li>
                </ul>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>🚀 遊び方</h3>
                <ol className={styles.list}>
                  <li>お名前を登録して、部屋を作成または参加</li>
                  <li>ホストが問題のテーマを設定</li>
                  <li>制限時間内に、散らばった文字から言葉を作成</li>
                  <li>チーム全体で協力して、できるだけ多くの正解を目指そう！</li>
                </ol>
              </div>

              <p className={styles.footer}>
                さあ、仲間と一緒に「文字もじ」を楽しみましょう！
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpButton;
