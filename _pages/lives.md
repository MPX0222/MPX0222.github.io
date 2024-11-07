---
layout: archive
title: "Lives"
permalink: /lives/
author_profile: true
---

<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">

<style>
  /* Base styles */
  body {
    font-family: 'Lato', sans-serif;
    background-color: #f8f9fa;
    line-height: 1.6;
    color: #2c3e50;
    font-size: 15px;
  }

  /* Academic Typography Hierarchy */
  h1 {
    font-family: 'Lato', sans-serif;
    font-size: 1.8rem;
    font-weight: 900;
    color: #1a365d;
    margin: 0 0 1.5rem 0;
    padding: 1rem 0;
    border-bottom: 3px solid #2c5282;
    letter-spacing: -0.5px;
  }

  h3 {
    font-family: 'Lato', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #2d3748;
    margin: 1.5rem 0 0.75rem 0;
    letter-spacing: -0.3px;
  }

  /* Life Container */
  .life-container {
    background-color: white;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border: 1px solid #e2e8f0;
  }

  /* Life Item */
  .life-item {
    display: flex;
    align-items: center;
    margin: 1rem 0;
    padding: 1.25rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: white;
  }

  /* Image Container */
  .paper-logo-column {
    flex: 0 0 120px;
    margin-right: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
  }

  .logo {
    max-width: 120px;
    max-height: 120px;
    width: auto;
    height: auto;
    object-fit: contain;
    display: block;
  }

  /* Content Column */
  .paper-title-column {
    flex: 1;
  }

  /* Info */
  .info {
    font-family: 'Lato', sans-serif;
    font-size: 0.9rem;
    line-height: 1.6;
    color: #4a5568;
    margin: 0.5rem 0;
  }

  /* Links */
  a {
    color: #2c5282;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  a:hover {
    color: #4299e1;
  }

  /* Table Styles */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    font-family: 'Lato', sans-serif;
    font-size: 0.95rem;
  }

  th, td {
    padding: 1rem;
    border: 1px solid #e2e8f0;
    text-align: center;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #2d3748;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .life-item {
      flex-direction: column;
    }

    .paper-logo-column {
      margin-bottom: 1.5rem;
      margin-right: 0;
    }
  }
</style>

{% for post in site.lives reversed %}
  <div class="life-container">
    <div class="life-item">
      <div class="paper-logo-column">
        <img src="{{ post.header.teaser }}" alt="Life Event" class="logo">
      </div>
      <div class="paper-title-column">
        <h3>{{ post.title }}</h3>
        <p class="info">{{ post.date | date: "%B %Y" }}</p>
        <p class="info">{{ post.location }}</p>
        <p class="info">{{ post.description }}</p>
      </div>
    </div>
  </div>
{% endfor %}
