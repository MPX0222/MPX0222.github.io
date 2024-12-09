---
permalink: /
title: "Introduction"
layout: archive
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">

<style>
  /* Base styles */
  body {
    font-family: 'Lato', sans-serif;
    background-color: #fafafa;
    line-height: 1.7;
    color: #2d3748;
    font-size: 16px;
  }

  /* Academic Section Container */
  .main-container {
    background-color: #ffffff;
    border-radius: 4px;
    padding: 2.8rem 3.2rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    border: 1px solid #edf2f7;
  }

  /* Section Headers */
  h1 {
    font-family: 'Lato', sans-serif;
    font-size: 1.9rem;
    font-weight: 700;
    color: #1a365d;
    margin: 2rem 0 1.8rem 0;
    padding-bottom: 0.8rem;
    border-bottom: 2px solid #e2e8f0;
    letter-spacing: -0.02em;
  }

  h3 {
    font-family: 'Lato', sans-serif;
    font-size: 1.35rem;
    font-weight: 600;
    color: #2d3748;
    margin: 1.8rem 0 1rem 0;
    letter-spacing: -0.01em;
  }

  /* Content Container */
  .container {
    display: flex;
    align-items: flex-start;
    margin: 1.8rem 0;
    padding: 2rem;
    border: 1px solid #edf2f7;
    border-radius: 4px;
    background-color: #ffffff;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
  }

  /* Content Text */
  p, .info {
    font-family: 'Lato', sans-serif;
    font-size: 1rem;
    line-height: 1.8;
    color: #4a5568;
    margin: 1rem 0;
  }

  /* Links */
  a {
    color: #3182ce;
    text-decoration: none;
    transition: color 0.15s ease;
    border-bottom: 1px solid transparent;
    
    &:hover {
      color: #2c5282;
      border-bottom-color: #2c5282;
    }
  }

  /* List Items */
  .li-container {
    padding: 0.5rem 1.5rem;
  }

  li.info {
    padding-left: 1.5rem;
    margin: 0.8rem 0;
    position: relative;
    
    &:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #718096;
    }
  }

  /* Table Styles */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    font-size: 0.95rem;
    
    th, td {
      padding: 1rem;
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    
    th {
      background-color: #f7fafc;
      font-weight: 600;
      color: #2d3748;
    }
    
    tr:hover {
      background-color: #f7fafc;
    }
  }

  /* Dark mode adjustments */
  @media (prefers-color-scheme: dark) {
    body {
      background-color: #1a202c;
      color: #e2e8f0;
    }

    .main-container,
    .container {
      background-color: #2d3748;
      border-color: #4a5568;
    }

    h1 {
      color: #90cdf4;
      border-bottom-color: #4a5568;
    }

    h3 {
      color: #e2e8f0;
    }

    p, .info {
      color: #cbd5e0;
    }

    a {
      color: #63b3ed;
      
      &:hover {
        color: #90cdf4;
        border-bottom-color: #90cdf4;
      }
    }
  }
</style>

<div class="main-container">
  <p>
    Hello! I am a M.Phil. student of <a href="https://www.hkust-gz.edu.cn/">The Hong Kong University of Science and Technology GuangZhou (HKUSTGZ)</a>. Now I am studying in <a href="https://www.hkust-gz.edu.cn/zh/academics/hubs-and-thrust-areas/information-hub/data-science-and-analytics/">Data Science and Analytics (DSA)</a> under the supervision of <a href="https://luoyuyu.vip/">Prof. Yuyu Luo</a> and <a href="https://nantang.github.io/">Prof. Nan Tang</a>, at the <a href="https://www.hkust-gz.edu.cn/zh/academics/hubs-and-thrust-areas/information-hub/">Information Hub (INFH)</a>.
  </p>

  <p>
    I have received the B.Eng. degree in Intelligence Science and Technology from <a href="https://english.jnu.edu.cn/">Jinan University (JNU)</a> in 2023. During my undergraduate live, I started my research by working as the undergraduate research assistant in the Data-driven Intelligent Systems Laboratory of Jinan University. My undergraduate research direction is the optimization and application of the Broad Learning System (BLS). Before my graduation, I received the offer from HKUST(GZ) and successflily enrolled in it in the Fall 2023.
  </p>

  <p>
    Currently, I participate in HKUST(GZ) Data Intelligence and Analytics Lab <a href="https://github.com/HKUSTDial">@HKUST(GZ)-DIAL 呆鹅实验室</a> and Red Bird AI Agent Narrative Storytelling Game Groups <a href="">@AASG</a>. My research interest comprises Database Management (DBMS), Mliti-agent System (MAS), Natural Language to SQL (NL2SQL) and Open-Source BLS. Here are the related links:
  </p>
</div>

<p align="center">
  HKUST(GZ)-DIAL | 呆鹅实验室
  ·
  <a href="https://github.com/HKUSTDial">Github</a>
  ·
  <a href="https://github.com/HKUSTDial">Homepage</a>
</p>

<p align="center">
  Personal CV | 个人简历
  ·
  <a href="https://mpx0222.github.io/">zh</a>
  ·
  <a href="https://mpx0222.github.io/">en</a>
</p>


<div class="main-container">
  <h1>📟 News</h1>
  <div class="li-container">
    <h3>2024</h3>
    <li class="info"> Aug 09. 📌 The Survey of HKUST(GZ)-DIAL NL2SQL Research Group: <a href="https://arxiv.org/pdf/2408.05109">A Survey of NL2SQL with Large Language Models: Where are we, and where are we going</a> is available on Arxiv.</li>
    <li class="info"> Jan 10. Successfliy pass the PQA of the Red Bird M.Phil Program.</li>
    <h3>2023</h3>
    <li class="info"> Jul 15. 📌 Receive offers from The Hong Kong University of Science and Technology (GuangZhou) and The Chinese University of Hong Kong (ShenZhen).</li>
    <li class="info"> Jul 08. 📌 My first long research paper: <a href="https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2023.1137557/pdf?isPublishedV2=false">Development and Validation of a Deep-broad Ensemble Model for Early Detection of Alzheimer’s Disease</a> has been accepted and published by Frontiers in Neuroscience</li>
    <li class="info"> May 05. 📌 Successflily pass the undergraduate graduation defense in Jinan University.</li>
  </div>
</div>

<div class="main-container">
  <h1>🎓 Education</h1>
  <div class="container">
    <div class="paper-logo-column">
      <img src="../images/hkust-logo.png" alt="University Logo" class="logo">
    </div>
    <div class="paper-title-column">
        <h3>The Hong Kong University of Science and Technology (Guangzhou)</h3>
        <p class="info">M.Phil. in Data Science and Analytics<br>2023.09 - 2025.07 (Expected)</p>
    </div>
  </div>
  <div class="container">
    <div class="paper-logo-column">
      <img src="../images/jnu-logo.png" alt="University Logo" class="logo">
    </div>
    <div class="paper-title-column">
      <h3>JiNan University</h3>
      <p class="info">B.Eng. in Intelligence Science and Technology<br>2019.09 - 2023.07</p>
    </div>
  </div>
</div>


<div class="main-container">
  <h1>��� Publications</h1>
  <div class="container">
    <div class="paper-logo-column">
      <img src="../images/rewriter.png" alt="" class="logo">
    </div>
    <div class="paper-title-column">
        <h3>A Plug-and-Play Natural Language Rewriter for Natural Language to SQL</h3>
        <p class="info"><b>Peixian Ma</b>, Boyan Li, Runzhi Jiang, Yuyu Luo, Ju Fan and Nan Tang<br><b>Arxiv</b></p>
    </div>
  </div>
  <div class="container">
    <div class="paper-logo-column">
      <img src="../images/survey.png" alt="University Logo" class="logo">
    </div>
    <div class="paper-title-column">
      <a href="https://arxiv.org/pdf/2408.05109">
        <h3>A Survey of NL2SQL with Large Language Models: Where are we, and where are we going</h3>
      </a>
      <p class="info">Xinyu Liu, Shuyu Shen, Boyan Li, <b>Peixian Ma</b>, Runzhi Jiang, Yuxin Zhang, Ju Fan, Guoliang Li, Yuyu Luo and Nan Tang<br><b>Arxiv</b></p>
      <a href="https://arxiv.org/pdf/2408.05109">
        <img alt="Static Badge" src="https://img.shields.io/badge/PDF-Arxiv_2024-brightgreen?logo=Arxiv">
      </a>
        <a href="https://github.com/HKUSTDial/NL2SQL_Handbook">
        <img alt="Static Badge" src="https://img.shields.io/badge/Github-NL2SQL_Handbook-blue?logo=Github">
      </a>
      <a href="https://github.com/HKUSTDial/NL2SQL_Handbook">
        <img alt="Static Badge" src="https://img.shields.io/badge/Tutorial-Open_Slides-red?logo=Googledrive">
      </a>
      <a href="https://github.com/HKUSTDial/NL2SQL_Handbook">
        <img alt="Static Badge" src="https://img.shields.io/github/stars/HKUSTDial/NL2SQL_Handbook?style=social">
      </a>
    </div>
  </div>
  
  <div class="container">
    <div class="paper-logo-column">
      <img src="../images/bls.png" alt="University Logo" class="logo">
    </div>
    <div class="paper-title-column">
      <a href="https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2023.1137557/pdf?isPublishedV2=false">
        <h3>Development and Validation of a Deep-broad Ensemble Model for Early Detection of Alzheimer's Disease</h3>
      </a>
      <p class="info"><b>Peixian Ma</b>, Jing Wang, Zhiguo Zhou, C. L. Philip Chen  Alzheimer’s Disease Neuroimaging Initiative and Junwei Duan<br><b>Frontiers in Neuroscience 2023</b></p>
      <a href="https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2023.1137557/pdf?isPublishedV2=false">
        <img alt="Static Badge" src="https://img.shields.io/badge/PDF-Frontiers_2023-brightgreen?logo=Arxiv">
      </a>
      <a href="https://github.com/MPX0222/BroadLearningSystemTools-2.0">
        <img alt="Static Badge" src="https://img.shields.io/badge/Github-BroadLearningSystemTools_2.0-blue?logo=Github">
      </a>
      <a href="https://github.com/MPX0222/BroadLearningSystemTools-2.0">
        <img alt="Static Badge" src="https://img.shields.io/github/stars/MPX0222/BroadLearningSystemTools-2.0?style=social">
      </a>
    </div>
  </div>
</div>


<div class="main-container">
  <h1>🏆 Selected Awards</h1>
  <div class="li-container">
    <h3>Academic Awards</h3>
    <li class="info"> Sept. 2024. 🏅 Red Bird Postgraduate Scholarship of The Hong Kong University of Science and Technology (GuangZhou).</li>
    <li class="info"> Sept. 2023. 🏅 Red Bird Postgraduate Scholarship of The Hong Kong University of Science and Technology (GuangZhou).</li>
    <li class="info"> Jun. 2023. 🏅 Distinguished Graduate, College of Information Science and Technology, Jinan University.</li>
    <li class="info"> Apr. 2023. 🏅 Silver Award in "Medicine +X" Virtual Simliation Competition for College students, Jinan University & Guangzhou Medical University.</li>
    <li class="info"> Dec. 2022. 🏅 Second Class Scholarship for Excellent Student, Jinan University.</li>
    <li class="info"> Dec. 2021. 🏅 Third Class Scholarship Excellent Student, Jinan University.</li>
    <li class="info"> May. 2021. 🏅 Honorable Mention for Mathematical Contest In Modeling, Jinan University.</li>    
    <h3>Sport Awards</h3>
    <li class="info"> Apr. 2024. 🥇 Champion of 2024 The Hong Kong University of Science and Technology (Guangzhou) Football Super League, RBM, CB, 4 Games,  2 Assist.</li>
    <li class="info"> Jun. 2023. 🥉 Third Place of 2022 Jinan University Football Super League, College of Information Science and Technology, CDM, 5 Games, 1 Goal, 2 Assist.</li>    
    <li class="info"> Oct. 2021. 🏆 Best Player of the Second Round in 2021 Jinan University Football Super League, Information Science and Technology.</li>
    <li class="info"> Jun. 2021. 🥇 Champion of 2020 Jinan University Football College Cup, College of Information Science and Technology, ST, 4 Games, 1 Goal, 1 Assist.</li>     
  </div>
</div>


<div class="main-container">
  <h1>💻Internships</h1>
  <div class="li-container">
    Jan. 2023 - Jun. 2023. Research Assistant, Big Data Center.
    <a href="https://xwxy.jnu.edu.cn/2018/1218/c12846a322831/page.psp">School of Journalism & Communication, Jinan University</a>
    <li class="info">Location: Guangzhou, China</li>
    <li class="info">Duties: Data Mining, Data Cleaning and Visualization </li>
    <li class="info">Supervisor: Junjie HUA</li> 
    Sept. 2020 - Dec. 2022. Research Assistant, Data-driven Intelligent Systems Laboratory.
    <a href="https://faclity.jnu.edu.cn/xxkxjsxy/djw/list.htm">College of Information Science of Technology, Jinan University</a>
    <li class="info">Location: Guangzhou, China</li>
    <li class="info">Duties: Conceptualization, Writing Draft, Validation, Data Visualization, Review and Project Administration</li>
    <li class="info">Supervisor: Junwei Duan, Yujuan Quan</li>
  </div>
</div>

<div class="main-container">
  <h1>🤖 Services</h1>
  <div class="li-container">
    <h3>Conference</h3>
    <li> 
      Aug. 2024. Guangzhou. Student Volunteer
      <a href="https://vldb.org/2024/"> 50th International Conference on Very Large Databases (VLDB 2024)</a>
    </li>    
  </div>
</div>

⚽ Football Life
===

<table>
  <tr>
    <td><b>Team</b></td>
    <td><b>Games</b></td>
    <td><b>Win</b></td>
    <td><b>Draw</b></td>
    <td><b>Loss</b></td>
    <td><b>Goal</b></td>
    <td><b>Assist</b></td>
  </tr>
  <tr>
    <td>The Hong Kong University of Science and Technology (Guangzhou) </td>
    <td>11</td>
    <td>8</td>
    <td>1</td>
    <td>2</td>
    <td><b>1</b></td>
    <td><b>3</b></td>
  </tr>
  <tr>
    <td>College of Information Science of Technology, JiNan University </td>
    <td>33</td>
    <td>20</td>
    <td>3</td>
    <td>10</td>
    <td><b>6</b></td>
    <td><b>4</b></td>
  </tr>
  <tr>
    <td>Happy My Lover, ZhongYuan High School</td>
    <td>8</td>
    <td>4</td>
    <td>0</td>
    <td>4</td>
    <td><b>0</b></td>
    <td><b>1</b></td>
  </tr>
</table>


