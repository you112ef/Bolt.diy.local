import React from 'react';
import { Switch } from '~/components/ui/Switch';
import { PromptLibrary } from '~/lib/common/prompt-library';
import { useSettings } from '~/lib/hooks/useSettings';

export default function FeaturesTab() {
  const {
    debug,
    enableDebugMode,
    isLocalModel,
    enableLocalModels,
    enableEventLogs,
    isLatestBranch,
    enableLatestBranch,
    promptId,
    setPromptId,
    autoSelectTemplate,
    setAutoSelectTemplate,
    enableContextOptimization,
    contextOptimizationEnabled,
  } = useSettings();

  const handleToggle = (enabled: boolean) => {
    enableDebugMode(enabled);
    enableEventLogs(enabled);
  };

  return (
    <div className="p-4 bg-bolt-elements-bg-depth-2 border border-bolt-elements-borderColor rounded-lg mb-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">ميزات اختيارية</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-bolt-elements-textPrimary">ميزات التصحيح</span>
            <Switch className="ml-auto" checked={debug} onCheckedChange={handleToggle} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-bolt-elements-textPrimary">استخدام الفرع الرئيسي</span>
              <p className="text-xs text-bolt-elements-textTertiary">
                التحقق من التحديثات من الفرع الرئيسي بدلاً من المستقر.
              </p>
            </div>
            <Switch className="ml-auto" checked={isLatestBranch} onCheckedChange={enableLatestBranch} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-bolt-elements-textPrimary">تحديد قالب الكود تلقائيًا</span>
              <p className="text-xs text-bolt-elements-textTertiary">
                دع يوسف يختار أفضل قالب ابتدائي لمشروعك.
              </p>
            </div>
            <Switch className="ml-auto" checked={autoSelectTemplate} onCheckedChange={setAutoSelectTemplate} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-bolt-elements-textPrimary">استخدام تحسين السياق</span>
              <p className="text-sm text-bolt-elements-textSecondary">
                تنقيح محتويات الملف من الدردشة ووضع أحدث محتويات الملف في موجه النظام.
              </p>
            </div>
            <Switch
              className="ml-auto"
              checked={contextOptimizationEnabled}
              onCheckedChange={enableContextOptimization}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 border-t border-bolt-elements-borderColor pt-4">
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">ميزات تجريبية</h3>
        <p className="text-sm text-bolt-elements-textSecondary mb-10">
          تنويه: الميزات التجريبية قد تكون غير مستقرة وعرضة للتغيير.
        </p>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-bolt-elements-textPrimary">مزودون تجريبيون</span>
            <Switch className="ml-auto" checked={isLocalModel} onCheckedChange={enableLocalModels} />
          </div>
          <p className="text-xs text-bolt-elements-textTertiary mb-4">
            تمكين المزودين التجريبيين مثل Ollama، LMStudio، و OpenAILike.
          </p>
        </div>
        <div className="flex items-start justify-between pt-4 mb-2 gap-2">
          <div className="flex-1 max-w-[200px]">
            <span className="text-bolt-elements-textPrimary">مكتبة الموجهات</span>
            <p className="text-xs text-bolt-elements-textTertiary mb-4">
              اختر موجهًا من المكتبة لاستخدامه كموجه نظام.
            </p>
          </div>
          <select
            value={promptId}
            onChange={(e) => setPromptId(e.target.value)}
            className="flex-1 p-2 ml-auto rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus transition-all text-sm min-w-[100px]"
          >
            {PromptLibrary.getList().map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
