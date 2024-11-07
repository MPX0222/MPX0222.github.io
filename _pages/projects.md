---
layout: archive
title: "Projects"
permalink: /projects/
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

  /* Project Container */
  .project-container {
    background-color: white;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border: 1px solid #e2e8f0;
  }

  /* Project Item */
  .project-item {
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

  /* Project Info */
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

  /* Badges */
  .badge-container {
    margin-top: 0.75rem;
  }

  img[alt="Static Badge"] {
    margin-right: 0.25rem;
    height: 20px;
  }

  /* Project Details */
  .project-details {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .tech-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .tech-tag {
    background-color: #edf2f7;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.8rem;
    color: #4a5568;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .project-item {
      flex-direction: column;
    }

    .paper-logo-column {
      margin-bottom: 1.5rem;
      margin-right: 0;
    }
  }
</style>

{% for post in site.projects reversed %}
  <div class="project-container">
    <div class="project-item">
      <div class="paper-logo-column">
        <img src="{{ post.header.teaser }}" alt="Project Preview" class="logo">
      </div>
      <div class="paper-title-column">
        <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
        <p class="info">{{ post.excerpt }}</p>
        <div class="badge-container">
          {% if post.github %}
            <a href="{{ post.github }}">
              <img alt="Static Badge" src="https://img.shields.io/badge/Github-Code-blue?logo=Github">
            </a>
          {% endif %}
          {% if post.demo %}
            <a href="{{ post.demo }}">
              <img alt="Static Badge" src="https://img.shields.io/badge/Demo-Live-green?logo=Chrome">
            </a>
          {% endif %}
        </div>
        {% if post.tech_stack %}
          <div class="project-details">
            <div class="tech-stack">
              {% for tech in post.tech_stack %}
                <span class="tech-tag">{{ tech }}</span>
              {% endfor %}
            </div>
          </div>
        {% endif %}
      </div>
    </div>
  </div>
{% endfor %}

