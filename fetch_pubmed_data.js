const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');

// PubMed API配置
const PUBMED_API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const API_KEY = process.env.PUBMED_API_KEY || ''; // 可选的PubMed API密钥

// 公共卫生相关的搜索词
const PUBLIC_HEALTH_QUERIES = [
  'public health',
  'epidemiology',
  'health policy',
  'health promotion',
  'disease prevention',
  'environmental health',
  'occupational health'
];

// 构建搜索URL
const buildSearchUrl = (query, page = 0) => {
  const offset = page * 10;
  return `${PUBMED_API_BASE}/esearch.fcgi?` +
         `db=pubmed&` +
         `term=${encodeURIComponent(query)}&` +
         `retmode=json&` +
         `retmax=10&` +
         `retstart=${offset}&` +
         (API_KEY ? `api_key=${API_KEY}` : '');
};

// 获取文章详细内容
const buildFetchUrl = (ids) => {
  return `${PUBMED_API_BASE}/efetch.fcgi?` +
         `db=pubmed&` +
         `id=${ids.join(',')}&` +
         `retmode=xml&` +
         `rettype=abstract&` +
         (API_KEY ? `api_key=${API_KEY}` : '');
};

// 解析XML格式的文章内容
const parseArticleXml = (xml) => {
  const articles = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const pubmedArticles = doc.getElementsByTagName('PubmedArticle');

  for (let i = 0; i < pubmedArticles.length; i++) {
    const article = pubmedArticles[i];
    const medlineCitation = article.getElementsByTagName('MedlineCitation')[0];
    const pmid = medlineCitation?.getElementsByTagName('PMID')[0]?.textContent || '';
    const articleTitle = medlineCitation?.getElementsByTagName('ArticleTitle')[0]?.textContent || '';
    
    // 提取完整摘要文本
    const abstractTextNodes = medlineCitation.getElementsByTagName('AbstractText');
    let abstract = '';
    for (let j = 0; j < abstractTextNodes.length; j++) {
      abstract += abstractTextNodes[j].textContent + '\n';
    }
    
    const journalTitle = medlineCitation?.getElementsByTagName('Title')[0]?.textContent || '';
    const pubDate = medlineCitation?.getElementsByTagName('PubDate')[0];
    const year = pubDate?.getElementsByTagName('Year')[0]?.textContent || '';
    const month = pubDate?.getElementsByTagName('Month')[0]?.textContent || '';
    const day = pubDate?.getElementsByTagName('Day')[0]?.textContent || '';
    const pubDateStr = `${year}-${month || ''}-${day || ''}`.replace(/-$/, '');

    articles.push({
      id: pmid,
      title: articleTitle,
      abstract: abstract.trim(),
      journal: journalTitle,
      pubDate: pubDateStr,
      link: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`
    });
  }
  return articles;
};

// 搜索PubMed
const searchPubMed = async (query) => {
  try {
    const response = await axios.get(buildSearchUrl(query));
    return response.data;
  } catch (error) {
    console.error(`搜索PubMed时出错: ${error.message}`);
    return null;
  }
};

// 获取文章详细内容
const getArticleDetails = async (ids) => {
  if (ids.length === 0) return [];
  
  try {
    const response = await axios.get(buildFetchUrl(ids));
    return parseArticleXml(response.data);
  } catch (error) {
    console.error(`获取文章内容时出错: ${error.message}`);
    return [];
  }
};

// 处理搜索结果并获取文章信息
const processSearchResults = async (query) => {
  const searchResults = await searchPubMed(query);
  if (!searchResults || !searchResults.esearchresult) return [];
  
  const ids = searchResults.esearchresult.idlist || [];
  if (ids.length === 0) return [];
  
  return await getArticleDetails(ids);
};

// 聚合所有搜索词的结果
const aggregateArticles = async () => {
  const allArticles = [];
  
  for (const query of PUBLIC_HEALTH_QUERIES) {
    const articles = await processSearchResults(query);
    allArticles.push(...articles);
  }
  
  // 去重处理
  const uniqueArticles = [...new Map(allArticles.map(article => [article.id, article])).values()];
  
  // 按发布日期排序
  return uniqueArticles.sort((a, b) => {
    const dateA = new Date(a.pubDate);
    const dateB = new Date(b.pubDate);
    return dateB - dateA; // 最新的排在前面
  });
};

// 创建文章存档目录
const ARCHIVE_DIR = path.join(__dirname, '_archives');
if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

// 保存文章数据到JSON文件
const saveArticlesToJson = (articles) => {
  const dataDir = path.join(__dirname, '_data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const data = {
    date: new Date().toISOString(),
    articles: articles.slice(0, 30) // 限制最多30篇文章
  };
  
  fs.writeFileSync(
    path.join(dataDir, 'articles.json'), 
    JSON.stringify(data, null, 2),
    'utf8'
  );
  
  console.log(`成功保存 ${data.articles.length} 篇文章到 _data/articles.json`);
};

// 将文章保存为Markdown文件存档
const saveArticlesToMarkdown = (articles) => {
  const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const mdPath = path.join(ARCHIVE_DIR, `${todayStr}.md`);

  // Markdown内容
  let mdContent = `---
layout: archive
date: ${today}
title: 公共卫生研究摘要 (${today})
---

# 公共卫生研究摘要 (${today})

共收录 ${articles.length} 篇研究文章

`;

  // 添加每篇文章内容
  articles.forEach((article, index) => {
    mdContent += `## ${index + 1}. ${article.title}

`;
    mdContent += `**期刊**: ${article.journal}
`;
    mdContent += `**发表日期**: ${article.pubDate}
`;
    mdContent += `**链接**: [PubMed](${article.link})

`;
    mdContent += `### 摘要
${article.abstract}

---

`;
  });

  // 保存文件
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`成功创建存档文件: ${mdPath}`);
};

// 主函数
// 在main函数中添加更严格的错误处理
const main = async () => {
  console.log('开始获取PubMed公共卫生动态...');
  try {
    const articles = await aggregateArticles();
    if (articles.length === 0) {
      console.error('未获取到任何文章数据，请检查API密钥和网络连接');
      process.exit(1); // 非零退出码让GitHub Actions识别失败
    }
    saveArticlesToJson(articles);
    saveArticlesToMarkdown(articles);
    console.log('数据获取完成');
  } catch (error) {
    console.error(`处理过程中出错: ${error.message}`);
    process.exit(1); // 确保错误时工作流失败
  }
};

main();
