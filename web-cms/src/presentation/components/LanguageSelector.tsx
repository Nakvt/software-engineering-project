import React, { useState, useRef, useEffect } from 'react';
import styles from './LanguageSelector.module.css';

interface Language {
  code: string;
  name: string;
  flag: string;
  speechCode: string;
  greeting: string;
}

const languages: Language[] = [
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳', speechCode: 'vi-VN', greeting: 'Xin chào, đã chọn tiếng Việt.' },
  { code: 'en', name: 'English (US)', flag: '🇬🇧', speechCode: 'en-US', greeting: 'Hello, English has been selected.' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳', speechCode: 'zh-CN', greeting: '你好，已选择中文。' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵', speechCode: 'ja-JP', greeting: 'こんにちは、日本語が選択されました。' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷', speechCode: 'ko-KR', greeting: '안녕하세요, 한국어가 선택되었습니다.' },
];

export const LanguageSelector: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<Language>(languages[1]); // Mặc định tiếng Anh
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hàm phát âm thanh / thuyết minh ngôn ngữ
  const speakLanguage = (lang: Language) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lang.greeting);
      utterance.lang = lang.speechCode;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Xử lý khi chọn một ngôn ngữ
  const handleSelectLang = (lang: Language) => {
    setSelectedLang(lang);
    setIsOpen(false);
    setSearchQuery('');
    speakLanguage(lang);
  };

  // Lọc danh sách theo từ khóa search
  const filteredLangs = languages.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container} ref={dropdownRef}>
      {/* Nút bấm hiển thị ngôn ngữ hiện tại */}
      <div className={styles.triggerBox} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles.label}>Selected language:</span>
        <div className={styles.currentSelection}>
          <span className={styles.flag}>{selectedLang.flag}</span>
          <span className={styles.langText}>{selectedLang.name}</span>
          <span className={styles.arrow}>▼</span>
        </div>
      </div>

      {/* Hộp thoại xổ xuống khi click */}
      {isOpen && (
        <div className={styles.dropdownModal}>
          {/* Nút Clear */}
          <div className={styles.clearWrapper}>
            <button
              className={styles.clearBtn}
              onClick={() => handleSelectLang(languages[1])}
            >
              Clear
            </button>
          </div>

          {/* Ô tìm kiếm (Search bar) */}
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Danh sách 5 ngôn ngữ */}
          <div className={styles.list}>
            {filteredLangs.length > 0 ? (
              filteredLangs.map((lang) => (
                <div
                  key={lang.code}
                  className={`${styles.item} ${
                    selectedLang.code === lang.code ? styles.active : ''
                  }`}
                  onClick={() => handleSelectLang(lang)}
                >
                  <span className={styles.flag}>{lang.flag}</span>
                  <span className={styles.itemName}>{lang.name}</span>
                </div>
              ))
            ) : (
              <div className={styles.noResult}>No languages found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};