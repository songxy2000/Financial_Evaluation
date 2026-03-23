import styles from "./SearchInput.module.css";

interface SearchInputProps {
  defaultValue?: string;
}

export default function SearchInput({ defaultValue }: SearchInputProps) {
  return (
    <label className={styles.label}>
      <span>搜索</span>
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="输入产品名或机构名"
        className={styles.input}
      />
    </label>
  );
}
