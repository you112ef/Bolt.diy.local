import { useState } from 'react';
import { SettingsWindow } from '~/components/settings/SettingsWindow';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import styles from './SettingsView.module.scss';

export function SettingsView() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className={styles.settingsViewContainer}>
      <h2>الإعدادات والمظهر</h2>
      <div className={styles.settingItem}>
        <span>تبديل المظهر (فاتح/داكن):</span>
        <ThemeSwitch />
      </div>
      <div className={styles.settingItem}>
        <button onClick={() => setIsSettingsOpen(true)} className={styles.button}>
          فتح إعدادات التطبيق التفصيلية
        </button>
      </div>
      <SettingsWindow open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
