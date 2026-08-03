import Image from 'next/image';

type PageHeadingProps = {
  /** 페이지 제목 */
  title: string;
  /** 제목 위에 보여줄 설명 (선택) */
  description?: string;
  /** 배경으로 보여줄 배너 이미지 경로 (선택) */
  image?: string;
};

/* AI-generated : week06-fsd.md 애매한 파일 결정표 기준 — 비즈니스 로직 없는 순수 프레젠테이션 */
/* AI-generated : image가 있을 때만 next/image 배경 + week05-hero--banner modifier 적용, /products처럼 image 없는 사용처는 기존 동작 그대로 */
export function PageHeading({ title, description, image }: PageHeadingProps) {
  return (
    <section className={image ? 'week05-hero week05-hero--banner' : 'week05-hero'}>
      {image && <Image src={image} alt="" fill priority className="week05-hero-image" />}
      {description && <p>{description}</p>}
      <h1>{title}</h1>
    </section>
  );
}
