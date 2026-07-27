import { redirect } from 'next/navigation';

export default function RootPage() {
  // home URL로 다이렉트 이동하기 위해서 추가
  redirect('/home');
}
