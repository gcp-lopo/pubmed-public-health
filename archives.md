---
layout: default
title: 历史文章摘要存档
permalink: /archives/
---

<div class="archives-index">
  <h1>历史文章摘要存档</h1>
  <p>以下是每日公共卫生研究文章摘要的存档记录：</p>

  <ul class="archive-list">
    {% for archive in site.archives %}
      <li>
        <a href="{{ archive.url | relative_url }}" class="archive-link">
          {{ archive.date | date: "%Y年%m月%d日" }} - {{ archive.title }}
        </a>
      </li>
    {% endfor %}
  </ul>
</div>

<style>
.archives-index {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
.archive-list {
  list-style: none;
  padding: 0;
}
.archive-list li {
  margin: 0.8rem 0;
  padding: 0.8rem;
  border-radius: 4px;
  background-color: #f9f9f9;
  transition: background-color 0.3s;
}
.archive-list li:hover {
  background-color: #f0f0f0;
}
.archive-link {
  text-decoration: none;
  color: #333;
  font-size: 1.1rem;
}
.archive-link:hover {
  text-decoration: underline;
  color: #0066cc;
}
</style>