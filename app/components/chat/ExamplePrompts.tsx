import React from 'react';

const EXAMPLE_PROMPTS = [
  { text: 'أنشئ تطبيق قائمة مهام باستخدام React و Tailwind' },
  { text: 'أنشئ مدونة بسيطة باستخدام Astro' },
  { text: 'أنشئ نموذج موافقة على ملفات تعريف الارتباط باستخدام Material UI' },
  { text: 'اصنع لعبة غزاة الفضاء' },
  { text: 'اصنع لعبة إكس أو (Tic Tac Toe) باستخدام html و css و js فقط' },
];

export function ExamplePrompts(sendMessage?: { (event: React.UIEvent, messageInput?: string): void | undefined }) {
  return (
    <div id="examples" className="relative flex flex-col gap-9 w-full max-w-3xl mx-auto flex justify-center mt-6">
      <div
        className="flex flex-wrap justify-center gap-2"
        style={{
          animation: '.25s ease-out 0s 1 _fade-and-move-in_g2ptj_1 forwards',
        }}
      >
        {EXAMPLE_PROMPTS.map((examplePrompt, index: number) => {
          return (
            <button
              key={index}
              onClick={(event) => {
                sendMessage?.(event, examplePrompt.text);
              }}
              className="border border-bolt-elements-borderColor rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary px-3 py-1 text-xs transition-theme"
            >
              {examplePrompt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
