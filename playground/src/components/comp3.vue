<script setup lang="ts">
// 这里可以添加你的逻辑
const newsList = [
  { title: '公司新闻1', link: '#' },
  { title: '公司新闻2', link: '#' },
  { title: '公司新闻3', link: '#' },
]
</script>

<template>
  <div
    style="
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f5f6fa;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    "
  >
    <header
      style="
        background: #2d8cf0;
        color: #fff;
        padding: 24px 0 16px 0;
        text-align: center;
      "
    >
      <h1>门户网站</h1>
      <nav style="margin-top: 12px;">
        <a
          v-for="(nav, idx) in ['首页', '新闻', '关于我们', '联系我们']"
          :key="nav"
          href="#"
          style="
            color: #fff;
            margin: 0 16px;
            text-decoration: none;
            font-weight: 500;
            transition: text-decoration 0.2s;
          "
          @mouseover="e => e.target.style.textDecoration = 'underline'"
          @mouseout="e => e.target.style.textDecoration = 'none'"
        >{{ nav }}</a>
      </nav>
    </header>
    <main
      style="
        flex: 1;
        max-width: 900px;
        margin: 32px auto 0 auto;
        padding: 0 16px;
      "
    >
      <section
        style="
          background: #fff;
          border-radius: 8px;
          padding: 32px 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          text-align: center;
          margin-bottom: 32px;
        "
      >
        <h2>欢迎来到我们的门户网站</h2>
        <p>这里是企业、学校或组织的门户首页.</p>
      </section>
      <section
        style="
          background: #fff;
          border-radius: 8px;
          padding: 24px 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        "
      >
        <h3 style="margin-bottom: 16px;">
          最新新闻
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li
            v-for="item in newsList"
            :key="item.title"
            style="margin-bottom: 10px;"
          >
            <a
              :href="item.link"
              style="
                color: #2d8cf0;
                text-decoration: none;
                transition: text-decoration 0.2s;
              "
              @mouseover="e => e.target.style.textDecoration = 'underline'"
              @mouseout="e => e.target.style.textDecoration = 'none'"
            >{{ item.title }}</a>
          </li>
        </ul>
      </section>
    </main>
    <footer
      style="
        background: #222;
        color: #fff;
        text-align: center;
        padding: 16px 0;
        font-size: 14px;
        margin-top: 40px;
      "
    >
      &copy; 2025 门户网站. 保留所有权利.
    </footer>
  </div>
</template>

<style scoped></style>
