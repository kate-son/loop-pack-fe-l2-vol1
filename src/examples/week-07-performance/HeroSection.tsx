import Image from 'next/image';
import type { HomeResponse } from '@/entities/product/model/product';
import styles from './HeroSection.module.css';

type HeroSectionProps = Pick<HomeResponse['banner'], 'title' | 'description'>;

/* AI-generated : 상대경로 src 버그 수정 + next/image(fill, priority)로 전환하여 LCP 최적화 */
export function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <section className={styles.hero} aria-labelledby="week07-hero-title">
      <Image
        className={styles.image}
        src="/images/week-07/hero-original.jpg"
        alt=""
        fill
        sizes="100vw"
        priority
      />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>이번 주의 발견</p>
        <h2 id="week07-hero-title">{title}</h2>
        <p>{description}</p>
      </div>
    </section>
  );
}
