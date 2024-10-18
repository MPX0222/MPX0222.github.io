---
layout: archive
title: "Projects"
permalink: /projects/
author_profile: true
---
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@100;400;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@100;400;600;700&display=swap" rel="stylesheet">

<style>
  body {
    font-family: "Open Sans";
  }

  td {
    border: 1px solid #000;
    text-align: center; 
    vertical-align: middle; 
  }

  h3 {
    font-family: "Open Sans";
    font-size: 20px;
  }


  .main-container {
    margin-bottom: 30px;
    margin-bottom: 15px;
  }

  .container {
    display: flex;
    overflow: auto;
    justify-content: center;
    align-items: center;
    background-color: white;
    padding: 0px;
    padding-left: 20px;
  }

  .logo-column {
    width: 20%; /* 第一列宽度 */
    text-align: left; /* 文本居中 */
  }

  .paper-logo-column {
    width: 20%; /* 第一列宽度 */
    text-align: left; /* 文本居中 */
  }


  .paper-title-column{
    margin-left: 20px;
    padding: 10px;
    width: 80%; /* 第二列宽度 */
  }

  .details-column {
    margin-left: 20px;
    width: 60%; /* 第二列宽度 */
  }

  .date-column {
    width: 20%; /* 第三列宽度 */
    font-size: 13px; /* 时间的字体大小 */
  }

  .logo {
    width: 100%;
    height: 100%;
  }

  .title {
    font-size: 25px;
  }

  .info {
    text-align: left;
    font-size: 13px;
  }
</style>

{% include base_path %}


{% for post in site.projects %}
<div class="main-container">
  <div class="container">
    <div class="paper-logo-column">
      <img src="{{ post.excerpt }}" alt="" class="logo">
    </div>
    <div class="paper-title-column">
      <a href="{{ base_path }}{{ post.url }}" rel="permalink">
        <h2 class="title">{{ post.title }}</h2>
      </a>
      <p class="info">
        {{ post.venue }},  {{ post.location }}
        <br>
        {{ post.date | date: '%B %d, %Y' }}
      </p>
    </div>
  </div>
  <hr>
{% endfor %}

