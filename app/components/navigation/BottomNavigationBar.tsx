import styles from './BottomNavigationBar.module.scss';

interface BottomNavigationBarProps {
  activeView: string;
  onNavigate: (view: 'Automation' | 'Templates' | 'AiAssistant' | 'Settings') => void;
}

export function BottomNavigationBar({ activeView, onNavigate }: BottomNavigationBarProps) {
  const navItems = [
    { id: 'Automation', label: 'أتمتة' },
    { id: 'Templates', label: 'قوالب' },
    { id: 'AiAssistant', label: 'مساعد ذكي' },
    { id: 'Settings', label: 'إعدادات' },
  ] as const; // Use const assertion for type safety

  return (
    <footer className={styles.navBar}>
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`${styles.navButton} ${activeView === item.id ? styles.active : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}
    </footer>
  );
}
