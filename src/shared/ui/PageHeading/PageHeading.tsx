import Image from 'next/image';
import styles from './PageHeading.module.css';

type PageHeadingProps = {
  /** 페이지 제목 */
  title: string;
  /** 제목 위에 보여줄 설명 */
  description: string;
  /** 히어로 높이를 줄인 버전 — 검색·필터 변경마다 스크롤이 맨 위로 이동하는 페이지(/products)에서 그 이동 폭을 줄이기 위해 사용 */
  compact?: boolean;
};

/* AI-generated : Home·Products 공통 Hero — shared는 entities/app을 몰라야 하므로 타입을 로컬에 선언하고 스타일도 shared 내부로 옮김 (FSD boundaries 위반 수정) */
/* AI-generated : Week 7 Part 1 — LCP 개선. 원본(hero-original.jpg)을 그대로 next/image(fill+priority)에 넘겨 요청 시점에 viewport·DPR에 맞는 크기로 서버에서 리사이즈·재인코딩하도록 하고, fetchpriority=high 프리로드를 적용. sizes는 실제 렌더 폭(최대 1200px)을 반영해 불필요하게 큰 srcset 후보가 선택되지 않게 함 */
/* AI-generated : Week 7 Part 2 — nuqs의 scroll:true 때문에 검색어를 입력할 때마다 페이지가 맨 위로 스크롤되는데, 히어로가 크면 그 이동 폭이 커서 체감이 나쁘다. compact prop으로 /products의 히어로 높이를 줄여 이동 폭 자체를 줄인다(스크롤 동작 자체는 그대로 둠) */
export function PageHeading({ title, description, compact = false }: PageHeadingProps) {
  return (
    <section
      className={`${styles.hero}${compact ? ` ${styles.heroCompact}` : ''}`}
      aria-labelledby="week07-hero-title"
    >
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
