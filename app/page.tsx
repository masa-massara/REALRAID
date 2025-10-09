import Image from "next/image";
import styles from "./Page.module.css";
import RegisterStartRootButton from "./ui/components/RegisterStartRootButton";
import HelpButton from "./ui/components/HelpButton";

export default function Home() {
  return (
    <div className={styles.container}>
      <RegisterStartRootButton />
      <HelpButton />
    </div>
  );
}
