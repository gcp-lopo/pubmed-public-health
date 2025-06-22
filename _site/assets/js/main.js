// assets/js/main.js
document.addEventListener('DOMContentLoaded', function() {
  // 页面加载完成后执行的代码
  console.log('PubMed公共卫生动态网站已加载');
  
  // 示例：从本地JSON获取数据并渲染
  async function renderArticles() {
    try {
      const response = await fetch('/data/articles.json');
      const data = await response.json();
      
      const newsList = document.querySelector('.news-list');
      newsList.innerHTML = '';
      
      data.articles.forEach(article => {
        const newsItem = document.createElement('article');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
          <h2 class="news-title">
            <a href="${article.link}" target="_blank">${article.title}</a>
          </h2>
          <div class="news-meta">
            <span class="journal">${article.journal}</span>
            <span class="pub-date">${article.pubDate}</span>
          </div>
          <div class="news-abstract">
            <p>${article.abstract}</p>
          </div>
          <div class="read-more">
            <a href="${article.link}" target="_blank">阅读全文 <i class="fas fa-external-link-alt"></i></a>
          </div>
        `;
        newsList.appendChild(newsItem);
      });
    } catch (error) {
      console.error('渲染文章数据失败:', error);
      document.querySelector('.news-list').innerHTML = '<p class="error">获取文章数据失败，请稍后重试</p>';
    }
  }
  
  // 执行渲染函数
  renderArticles();
});
