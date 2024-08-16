// theme.js
document.addEventListener('DOMContentLoaded', () => {
  const htmlElement = document.documentElement;
  const themeToggle1 = document.getElementById('dark-mode-checkbox');
  const themeToggle2 = document.getElementById('dark-mode-checkbox-2');

  // 从 localStorage 获取主题状态
  const isDark = localStorage.getItem('theme') === 'dark';

  // 根据状态添加或移除 dark 类
  if (isDark) {
      htmlElement.classList.remove('light');
      htmlElement.classList.add('dark');
      themeToggle1.checked = true;
      themeToggle2.checked = true;
  }else{
      htmlElement.classList.remove('dark');
      htmlElement.classList.add('light');
      themeToggle1.checked = false;
      themeToggle2.checked = false;
  }

  const switchBtn = document.getElementById('switchBtn');
  const switchBtn2 = document.getElementById('switchBtn2');
  switchBtn.addEventListener('change', () => {
    if (htmlElement.classList.contains('dark')) {
      htmlElement.classList.remove('dark');
      htmlElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      htmlElement.classList.remove('light');
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  });
  switchBtn2.addEventListener('change', () => {
    if (htmlElement.classList.contains('dark')) {
      htmlElement.classList.remove('dark');
      htmlElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      htmlElement.classList.remove('light');
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  });
});