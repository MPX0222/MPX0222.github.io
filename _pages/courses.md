---
layout: archive
title: "Courses"
permalink: /courses/
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

{% for post in site.courses reversed %}
  {% include archive-single.html %}
{% endfor %}
