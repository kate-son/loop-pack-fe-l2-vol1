import styles from './PageHeading.module.css';

type PageHeadingProps = {
  /** 페이지 제목 */
  title: string;
  /** 제목 위에 보여줄 설명 */
  description: string;
};

/* AI-generated : Home·Products 공통 Hero — shared는 entities/app을 몰라야 하므로 타입을 로컬에 선언하고 스타일도 shared 내부로 옮김 (FSD boundaries 위반 수정) */
export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <section className={styles.hero} aria-labelledby="week07-hero-title">
      {/* eslint-disable-next-line @next/next/no-img-element -- Week 7 intentionally starts with an unoptimized LCP image. */}
      <img
        className={styles.image}
        src="/images/week-07/hero-original.jpg"
        alt=""
        width={3840}
        height={2160}
      />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>이번 주의 발견</p>
        <h2 id="week07-hero-title">{title}</h2>
        <p>{description}</p>
      </div>
    </section>
  );
}
