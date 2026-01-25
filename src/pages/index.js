import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary')}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={clsx('buttons')}>
          <Link
            className="button button--primary button--lg"
            to="/docs/guides/quick-start">
            Start Modding
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/api/Awaken/ECS/AwakenEcsBootstrap"
            style={{ marginLeft: '1rem' }}>
            Code Reference
          </Link>
        </div>
      </div>
    </header>
  );
}

function Feature({title, description, link, linkText}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="feature-card">
        <h3>{title}</h3>
        <p>{description}</p>
        <Link to={link} className="button button--secondary button--sm">
          {linkText}
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Unofficial Modding Documentation for Tainted Grail: Fall of Avalon">
      <HomepageHeader />
      <main>
        <section style={{ padding: '4rem 0' }}>
          <div className="container">
            <div className="row">
              <Feature 
                title="Quick Start" 
                description="Learn how to set up your environment and create your first mod in minutes."
                link="/docs/guides/quick-start"
                linkText="Read Guide"
              />
              <Feature 
                title="Code Reference" 
                description="Browse decompiled C# classes and methods from the game's Unity codebase."
                link="/docs/api/Awaken/ECS/AwakenEcsBootstrap"
                linkText="Explore Code"
              />
              <Feature 
                title="Scripting Cheatsheet" 
                description="Common patterns, top classes, and code snippets for quick reference."
                link="/docs/guides/scripting-cheatsheet"
                linkText="View Cheatsheet"
              />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
