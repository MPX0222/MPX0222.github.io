---
layout: archive
title: "Logs"
permalink: /lives/
author_profile: true
---

<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@100;400;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@100;400;600;700&display=swap" rel="stylesheet">

<style>
  body {
    font-family: "Open Sans";
  }
</style>

{% if site.talkmap_link == true %}

<p style="text-decoration:underline;"><a href="/talkmap.html">See a map of all the places I've given a talk!</a></p>

{% endif %}

{% for post in site.talks reversed %}
  {% include archive-single-talk.html %}
{% endfor %}
