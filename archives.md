---
layout: default
title: 历史文章摘要存档
permalink: /archives/
---

<div class="archives-index">
  <h1>历史文章摘要存档</h1>
  <p>以下是每日公共卫生研究文章摘要的存档记录：</p>

  {% assign archives_collection = site.collections | where: "label", "archives" | first %}
  <ul class="archive-list">
    {% for archive in archives_collection.docs %}
      <li>
        <a href="{{ archive.url | relative_url }}" class="archive-link">
            <span class="archive-date">{{ archive.date | date: "%Y年%m月%d日" }}</span>
            <span class="archive-title">{{ archive.title }}</span>
          </a>
      </li>
    {% endfor %}
  </ul>
</div>

<style>
.archives-index {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  font-family: 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
@supports (font-variation-settings: normal) {
  .archives-index {
    font-family: 'Inter var', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
}
body {
  background-color: #f7fafc;
  background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
  background-size: 20px 20px;
}
.archives-header {
  margin-bottom: 3rem;
  text-align: center;
}
.archives-header h1 {
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 1rem;
  font-weight: 700;
  position: relative;
  display: inline-block;
  padding-bottom: 0.8rem;
}
.archives-header h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #3182ce, #63b3ed);
  border-radius: 2px;
  transition: width 0.3s ease;
}
.archives-header h1:hover::after {
  width: 120px;
}
.archives-header p {
  font-size: 1.1rem;
  color: #4a5568;
  margin-bottom: 3rem;
  max-width: 700px;
  line-height: 1.7;
  letter-spacing: 0.01em;
  font-weight: 450;
}
.archive-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}
@media (max-width: 768px) {
  .archive-list {
    grid-template-columns: 1fr;
  }
  .archives-header h1 {
    font-size: 2rem;
  }
}
.archive-list li {
  margin: 0;
  padding: 2.2rem;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(253,254,255,1) 100%);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 4px 6px -2px rgba(0, 0, 0, 0.01);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  opacity: 0;
  transform: translateY(10px);
  animation: fadeIn 0.6s ease forwards;
}
.archive-list li::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, #4299e1, #63b3ed);
  border-radius: 4px 4px 0 0;
  transition: opacity 0.3s ease;
  opacity: 0;
}
.archive-list li:hover::before {
  opacity: 1;
}
@media (max-width: 480px) {
  .archive-list li {
    padding: 1.8rem;
  }
  .archive-title {
    font-size: 1.2rem;
  }
}
.archive-list li::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(49,130,206,0.1), rgba(99,179,237,0.05));
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.archive-list li:nth-child(2n) { animation-delay: 0.1s; }
.archive-list li:nth-child(3n) { animation-delay: 0.2s; }
.archive-list li:nth-child(4n) { animation-delay: 0.3s; }
.archive-list li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #3182ce 0%, #63b3ed 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.archive-list li:hover::before {
  opacity: 1;
}
.archive-list li:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01);
  border-color: transparent;
}
.archive-link {
  text-decoration: none;
  color: #2d3748;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.archive-date {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background-color: rgba(49, 130, 206, 0.08);
  border-radius: 4px;
}
.archive-title {
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.6;
  color: #2d3748;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  letter-spacing: -0.015em;
  text-shadow: 0 0 1px rgba(0,0,0,0.01);
}
.archive-link:hover .archive-title {
  color: #3182ce;
  transform: translateX(4px);
  text-decoration: none;
  text-shadow: 0 0 2px rgba(49, 130, 206, 0.1);
}
.archive-link:hover .archive-title {
  color: #3182ce;
  text-decoration: none;
}
</style>