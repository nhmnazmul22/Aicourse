const projects = [
  {
    index: '01',
    name: 'Drive Flow',
    category: 'Mobility · REST API',
    description:
      'A role-based car rental API with secure booking flows, OTP verification, and a modular service architecture.',
    stack: ['Node.js', 'Express', 'MongoDB', 'JWT'],
    mark: 'DF',
    visual: 'drive',
  },
  {
    index: '02',
    name: 'Care.xyz',
    category: 'Care · Booking platform',
    description:
      'A care booking experience that connects families with caregivers for children, older adults, and people who are unwell.',
    stack: ['Next.js', 'NextAuth', 'MongoDB', 'Tailwind'],
    mark: 'care',
    visual: 'care',
  },
  {
    index: '03',
    name: 'KitchenConnect',
    category: 'Food · Marketplace',
    description:
      'A home-chef marketplace with role-based workflows, Stripe payments, and a responsive analytics dashboard.',
    stack: ['React', 'Express', 'Firebase', 'Stripe'],
    mark: 'KC',
    visual: 'kitchen',
  },
]

const skillGroups = [
  { label: 'Frontend', skills: 'TypeScript, Next.js, React, Redux Toolkit, Tailwind CSS' },
  { label: 'Backend', skills: 'Node.js, Express.js, Laravel, PHP, REST APIs' },
  { label: 'Data & tools', skills: 'MongoDB, Mongoose, SQL, MariaDB, Firebase, Appwrite, Git' },
  { label: 'Also exploring', skills: 'React Native, Expo, Figma, deployment' },
]

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className="arrow">{diagonal ? '↗' : '→'}</span>
}

function Wordmark() {
  return <a className="wordmark" href="#top" aria-label="Nazmul Hasan Mamun home"><span>NHM</span><i>.</i></a>
}

export default function Home() {
  return (
    <main id="top">
      <header className="site-header wrap">
        <Wordmark />
        <nav aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#journey">Journey</a>
          <a href="#work">Selected work</a>
        </nav>
        <a className="header-contact" href="mailto:nhmnazmul22@gmail.com">Let’s talk <Arrow diagonal /></a>
      </header>

      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="availability"><span className="status-dot" /> Full stack developer <span className="location">· Cumilla, Bangladesh</span></p>
          <h1 id="hero-title">I build digital<br />products that <span>move</span><br />ideas forward.</h1>
          <p className="hero-summary">From the first architecture decision to the final detail on screen, I turn useful ideas into dependable web experiences.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#work">Explore selected work <Arrow /></a>
            <a className="text-link" href="https://nhmnazmul.vercel.app" target="_blank" rel="noreferrer">Visit portfolio <Arrow diagonal /></a>
          </div>
          <div className="hero-meta">
            <span>Currently at <b>ProspactBD Ltd.</b></span>
            <span>Working across <b>web & product</b></span>
          </div>
        </div>
        <div className="hero-art" aria-label="Abstract illustration of connected product systems" role="img">
          <div className="art-coordinate">23°27&apos; N<br />90°39&apos; E</div>
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="art-core"><span>NH</span><i /></div>
          <span className="node node-one" /><span className="node node-two" /><span className="node node-three" />
          <div className="art-caption"><span>IDEA → INTERFACE</span><span>BUILT WITH INTENT</span></div>
          <div className="art-vertical">THOUGHTFUL BY DESIGN</div>
        </div>
        <div className="hero-index"><span>SCROLL TO EXPLORE</span><span className="index-line" /></div>
      </section>

      <section className="intro-section" id="about">
        <div className="wrap intro-grid">
          <div className="section-kicker"><span className="kicker-mark" /> A little about me</div>
          <div className="intro-content">
            <h2>Good software is<br />clear in its purpose<br />and <span>careful in its craft.</span></h2>
            <div className="intro-bottom">
              <p>I’m Nazmul, a junior full stack developer who enjoys working across the whole product. I build with the MERN stack, Next.js, and Laravel, bringing structure to complex problems and care to the details people actually use.</p>
              <a href="mailto:nhmnazmul22@gmail.com" className="circle-link" aria-label="Email Nazmul"><Arrow diagonal /></a>
            </div>
          </div>
          <div className="intro-side"><span>01 / 04</span><p>Curious by nature.<br />Thoughtful by design.</p></div>
        </div>
      </section>

      <section className="journey-section wrap" id="journey">
        <div className="section-heading">
          <div><div className="section-kicker"><span className="kicker-mark" /> The path so far</div><h2>Experience &amp; education</h2></div>
          <p>A growing practice, built through real projects, collaboration, and a steady appetite to learn.</p>
        </div>
        <div className="timeline">
          <article className="timeline-entry current-entry">
            <div className="timeline-date">NOV 2025 — NOW</div>
            <div className="timeline-marker"><span /></div>
            <div className="timeline-copy"><p className="entry-type">Professional experience</p><h3>Jr. Full Stack Developer</h3><p className="entry-place">ProspactBD Ltd. <span>·</span> Siddhirganj, Narayanganj</p><p className="entry-description">Contributing to a multi-tenant eCommerce platform across Laravel and Next.js. Shaping maintainable backend architecture with SOLID principles, and building reusable features alongside a collaborative team.</p><div className="tag-list"><span>Laravel</span><span>Next.js</span><span>Multi-tenant eCommerce</span></div></div>
          </article>
          <article className="timeline-entry">
            <div className="timeline-date">2025 — 2026</div>
            <div className="timeline-marker"><span /></div>
            <div className="timeline-copy"><p className="entry-type">Professional development</p><h3>Complete Web Development</h3><p className="entry-place">Programming Hero <span>·</span> Certificate</p><p className="entry-description">A hands-on program building practical skills across modern web development, from frontend foundations to full stack projects.</p></div>
          </article>
          <article className="timeline-entry">
            <div className="timeline-date">2024 — 2024</div>
            <div className="timeline-marker"><span /></div>
            <div className="timeline-copy"><p className="entry-type">Professional development</p><h3>Full Stack Web Development with MERN</h3><p className="entry-place">Ostad <span>·</span> Certificate</p><p className="entry-description">Built a strong foundation in MongoDB, Express, React, and Node.js through focused, project-based learning.</p></div>
          </article>
          <article className="timeline-entry">
            <div className="timeline-date">MAR 2024 — NOW</div>
            <div className="timeline-marker"><span /></div>
            <div className="timeline-copy"><p className="entry-type">Education</p><h3>Bachelor of Arts, English</h3><p className="entry-place">Govt. Tolaram College and University <span>·</span> Narayanganj</p><p className="entry-description">Studying literature, composition, and communication—strengthening the analytical thinking and clarity I bring to product work.</p></div>
          </article>
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="wrap">
          <div className="section-heading work-heading">
            <div><div className="section-kicker"><span className="kicker-mark" /> Selected work</div><h2>Built to be useful.</h2></div>
            <p>A few projects that bring together product thinking, solid foundations, and a little bit of ambition.</p>
          </div>
          <div className="project-list">
            {projects.map((project) => (
              <article className={`project-card ${project.visual}`} key={project.name}>
                <div className="project-visual" aria-hidden="true"><div className="visual-grid" /><div className="visual-shape"><span>{project.mark}</span><i /></div><div className="visual-orbit" /><span className="visual-index">{project.index}</span></div>
                <div className="project-content"><div className="project-topline"><span>{project.category}</span><span>0{Number(project.index)} / 03</span></div><h3>{project.name}</h3><p>{project.description}</p><div className="project-tags">{project.stack.map((tech) => <span key={tech}>{tech}</span>)}</div><a className="project-link" href="https://github.com/nhmnazmul22" target="_blank" rel="noreferrer">Browse source on GitHub <Arrow diagonal /></a></div>
              </article>
            ))}
          </div>
          <div className="portfolio-callout"><p>More in the portfolio</p><span>See what else I’m building.</span><a className="button button-light" href="https://nhmnazmul.vercel.app" target="_blank" rel="noreferrer">Visit my portfolio <Arrow diagonal /></a></div>
        </div>
      </section>

      <section className="capabilities-section wrap">
        <div className="capabilities-intro"><div className="section-kicker"><span className="kicker-mark" /> Tools of the trade</div><h2>One product.<br />Many moving parts.</h2><p>I’m comfortable zooming out to see the system, then zooming in to make each interaction feel right.</p></div>
        <div className="skill-table">{skillGroups.map((group) => <div className="skill-row" key={group.label}><h3>{group.label}</h3><p>{group.skills}</p><span aria-hidden="true">↗</span></div>)}</div>
      </section>

      <footer className="footer-section">
        <div className="wrap footer-inner"><div className="section-kicker"><span className="kicker-mark" /> Have a good idea?</div><h2>Let’s make it<br /><span>real.</span></h2><div className="footer-bottom"><a href="mailto:nhmnazmul22@gmail.com" className="footer-email">nhmnazmul22@gmail.com <Arrow diagonal /></a><div className="social-links"><a href="https://github.com/nhmnazmul22" target="_blank" rel="noreferrer">GitHub <Arrow diagonal /></a><a href="https://www.linkedin.com/in/nhm-nazmul" target="_blank" rel="noreferrer">LinkedIn <Arrow diagonal /></a><a href="tel:+8801940520508">+880 1940 520508</a></div></div><div className="footer-legal"><Wordmark /><span>© 2026 Nazmul Hasan Mamun</span><a href="#top">Back to top ↑</a></div></div>
      </footer>
    </main>
  )
}
