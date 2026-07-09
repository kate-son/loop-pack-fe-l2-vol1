'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';

export default function DialogPage() {
  const [isControlledDialogOpen, setIsControlledDialogOpen] = useState(false);

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Dialog (Compound)</h1>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Uncontrolled</h2>
        <Dialog>
          <Dialog.Trigger>다이얼로그 열기</Dialog.Trigger>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>제목</Dialog.Title>
            <Dialog.Description>설명 텍스트입니다.</Dialog.Description>
            <Dialog.Close>닫기</Dialog.Close>
          </Dialog.Content>
        </Dialog>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Controlled</h2>
        <button onClick={() => setIsControlledDialogOpen(true)}>외부 버튼으로 열기</button>
        <button onClick={() => setIsControlledDialogOpen(false)}>외부 버튼으로 닫기</button>
        <Dialog
          open={isControlledDialogOpen}
          onOpenChange={setIsControlledDialogOpen}
          closeOnOutsideInteraction={false}
        >
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>제목 (controlled)</Dialog.Title>
            <Dialog.Description>open 상태를 page.tsx가 직접 소유합니다.</Dialog.Description>
            <Dialog.Close>닫기</Dialog.Close>
          </Dialog.Content>
        </Dialog>
      </section>
    </main>
  );
}
