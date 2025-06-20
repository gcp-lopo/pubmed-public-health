const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

// 获取文章摘要
const buildSummaryUrl = (ids) => {
  return `${PUBMED_API_BASE}/esummary.fcgi?` +
         `db=pubmed&` +
         `id=${ids.join(',')}&` +
         `retmode=json&` +
         (API_KEY ? `api_key=${API_KEY}` : '');
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

// 获取文章摘要
const getArticleSummaries = async (ids) => {
  if (ids.length === 0) return [];
  
  try {
    const response = await axios.get(buildSummaryUrl(ids));
    return response.data.result || {};
  } catch (error) {
    console.error(`获取文章摘要时出错: ${error.message}`);
    return {};
  }
};

// 处理搜索结果并获取文章信息
const processSearchResults = async (query) => {
  const searchResults = await searchPubMed(query);
  if (!searchResults || !searchResults.esearchresult) return [];
  
  const ids = searchResults.esearchresult.idlist || [];
  if (ids.length === 0) return [];
  
  const summaries = await getArticleSummaries(ids);
  const articles = [];
  
  ids.forEach(id => {
    const summary = summaries[id];
    if (summary) {
      articles.push({
        id: summary.id,
        title: summary.title,
        abstract: summary.abstract || '',
        journal: summary.jrnl || '',
        pubDate: summary.pubdate || '',
        link: `https://pubmed.ncbi.nlm.nih.gov/${id}`
      });
    }
  });
  
  return articles;
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

// 保存文章数据到文件
const saveArticlesToFile = (articles) => {
  const dataDir = path.join(__dirname, 'data');
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
  
  console.log(`成功保存 ${data.articles.length} 篇文章到 data/articles.json`);
};

// 主函数
const main = async () => {
  console.log('开始获取PubMed公共卫生动态...');
  try {
    const articles = await aggregateArticles();
    saveArticlesToFile(articles);
    console.log('数据获取完成');
  } catch (error) {
    console.error(`处理过程中出错: ${error.message}`);
  }
};

main();