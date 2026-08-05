import Image from 'next/image';
import styles from './PageHeading.module.css';

type PageHeadingProps = {
  /** 페이지 제목 */
  title: string;
  /** 제목 위에 보여줄 설명 */
  description: string;
};

/* AI-generated : Home·Products 공통 Hero — shared는 entities/app을 몰라야 하므로 타입을 로컬에 선언하고 스타일도 shared 내부로 옮김 (FSD boundaries 위반 수정) */
/* AI-generated : Week 7 Part 1 — LCP 개선. 원본(hero-original.jpg)을 그대로 next/image(fill+priority)에 넘겨 요청 시점에 viewport·DPR에 맞는 크기로 서버에서 리사이즈·재인코딩하도록 하고, fetchpriority=high 프리로드를 적용. sizes는 실제 렌더 폭(최대 1200px)을 반영해 불필요하게 큰 srcset 후보가 선택되지 않게 함 */
export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <section className={styles.hero} aria-labelledby="week07-hero-title">
      <Image
        className={styles.image}
        src="/images/week-07/hero-original.jpg"
        alt=""
        fill
        sizes="(min-width: 1200px) 1200px, 100vw"
        priority
        fetchPriority="high"
      />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>이번 주의 발견</p>
        <h2 id="week07-hero-title">{title}</h2>
        <p>{description}</p>
      </div>
    </section>
  );
}
