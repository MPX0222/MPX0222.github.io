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
</style>


{% include base_path %}


{% for post in site.projects %}
<div class="main-container">
  <div class="container">
    <div class="paper-logo-column">
      <img src={{ post.excerpt }} alt="" class="logo">
    </div>
    <div class="paper-title-column">
      <a href="{{ base_path }}{{ post.url }}" rel="permalink">
        <h2 class="title">{{ post.title }}</h2>
      </a>
      <p class="info">
        {{ post.venue }},  {{ post.location }}
        <br>
        {{ post.date | date: '%B %d, %Y' }}<
      </p>
    </div>
  </div>
  <hr>
{% endfor %}

