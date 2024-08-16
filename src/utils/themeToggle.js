// theme.js
  // 从 localStorage 获取主题状态
const isDark = localStorage.getItem('theme') === 'dark';

const htmlElement = document.documentElement;
const switchBtns = document.querySelectorAll('div[data-name]')

switchBtns.forEach((switchBtn) => {
  // 根据状态设置按钮初始状态
  switchBtn.firstElementChild.checked = isDark;
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
})