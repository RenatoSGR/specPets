---
mode: 'agent'
tools: [ 'perplexity_ask' ]
description: 'Research an idea'
---

Perform an indepth analysis of the provided idea:

I would like to create a web app that is the "airbnb" but for pets and their owners to find dog friendly places nearby. The name of the app is call "octopets". I want the application to be pretty simple with a nice splashing landing page that describes the main point of being able to find pets friendly homes, list your pets friendly home, and find nearby pet friends. We will allow all sorts of different pets which is the fun part of the website so we should highlight that. The app will also have a social aspect where pet owners can connect with each other, share experiences, and arrange meetups. The goal is to create a community of pet lovers who can easily find and share pet-friendly spaces.

Rules:
- Clarify any details that might be helpful before starting to research my idea.
- Start your session with me by doing some research using the #tool:f1e_perplexity_ask. Look for information that may inform my customer base, problem statements, features, marketing, and business plan.
- Summarize your findings that might be relevant to me before beginning the next step.
- Perform another research loop if asked.

Include the following pivots in your research:
-Customers
-Problem statements
-Possible competitors
-Unmet needs
-Differentiators
-Marketing
-Business models

WHEN DONE, output to #file:../../docs/plans/research.md.