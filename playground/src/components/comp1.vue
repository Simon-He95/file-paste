<script setup lang="ts">
// 这里可以添加你的逻辑
const newsList = [
  { title: '公司新闻1', link: '#' },
  { title: '公司新闻2', link: '#' },
  { title: '公司新闻3', link: '#' },
]
</script>

<template>
  <div class="portal-container">
    <header class="portal-header">
      <h1>门户网站</h1>
      <nav>
        <a href="#">首页</a>
        <a href="#">新闻</a>
        <a href="#">关于我们</a>
        <a href="#">联系我们</a>
      </nav>
    </header>
    <main class="portal-main">
      <section class="banner">
        <h2>欢迎来到我们的门户网站</h2>
        <p>这里是企业、学校或组织的门户首页。</p>
      </section>
      <section class="news">
        <h3>最新新闻</h3>
        <ul>
          <li v-for="item in newsList" :key="item.title">
            <a :href="item.link">{{ item.title }}</a>
          </li>
        </ul>
      </section>
    </main>
    <footer class="portal-footer">
      &copy; 2025 门户网站. 保留所有权利.
    </footer>
  </div>
</template>

<style scoped>
.portal-container {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.portal-header {
  background: #2d8cf0;
  color: #fff;
  padding: 24px 0 16px 0;
  text-align: center;
}

.portal-header nav {
  margin-top: 12px;
}

.portal-header a {
  color: #fff;
  margin: 0 16px;
  text-decoration: none;
  font-weight: 500;
  transition: text-decoration 0.2s;
}

.portal-header a:hover {
  text-decoration: underline;
}

.portal-main {
  flex: 1;
  max-width: 900px;
  margin: 32px auto 0 auto;
  padding: 0 16px;
}

.banner {
  background: #fff;
  border-radius: 8px;
  padding: 32px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  text-align: center;
  margin-bottom: 32px;
}

.news {
  background: #fff;
  border-radius: 8px;
  padding: 24px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.news h3 {
  margin-bottom: 16px;
}

.news ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.news li {
  margin-bottom: 10px;
}

.news a {
  color: #2d8cf0;
  text-decoration: none;
  transition: text-decoration 0.2s;
}

.news a:hover {
  text-decoration: underline;
}

.portal-footer {
  background: #222;
  color: #fff;
  text-align: center;
  padding: 16px 0;
  font-size: 14px;
  margin-top: 40px;
}
</style>
