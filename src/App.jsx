import { useState } from "react";

const categories = [
  {
    id: "security",
    label: "Security & Network",
    color: "#ef4444",
    items: [
      {
        name: "UFW",
        full: "Uncomplicated Firewall",
        acronyms: ["UFW — Uncomplicated Firewall", "IP — Internet Protocol", "OS — Operating System"],
        what: "A frontend for iptables — manages which ports are open or blocked on the server at the OS level.",
        why: "First line of defence. Blocks all inbound traffic by default except what I explicitly allow. Keeps the attack surface minimal.",
      },
      {
        name: "Fail2ban",
        full: "Fail2ban",
        acronyms: ["IP — Internet Protocol", "SSH — Secure Shell"],
        what: "Watches log files for repeated failed login attempts and automatically bans the offending IP via UFW.",
        why: "Stops brute-force attacks on SSH and other services automatically. Without it, a bot can hammer the login indefinitely.",
      },
      {
        name: "CrowdSec",
        full: "CrowdSec",
        acronyms: ["IP — Internet Protocol"],
        what: "A collaborative threat intelligence tool. Detects malicious behaviour and shares attacker IPs with a global community blocklist.",
        why: "Works on top of Fail2ban. Blocks known bad actors before they even try — proactive rather than reactive. Community-sourced threat feeds mean I benefit from millions of other servers' detections.",
      },
      {
        name: "Tailscale",
        full: "Tailscale VPN",
        acronyms: ["VPN — Virtual Private Network", "SSH — Secure Shell"],
        what: "A zero-config VPN built on WireGuard. Creates a private mesh network between my devices.",
        why: "Lets me access the homeserver remotely without opening any inbound ports. SSH, admin panels, and internal services stay completely off the public internet.",
      },
      {
        name: "Cloudflare Tunnel",
        full: "Cloudflare Tunnel",
        acronyms: ["TLS — Transport Layer Security", "DDoS — Distributed Denial of Service", "DNS — Domain Name System"],
        what: "Creates an outbound-only encrypted tunnel from the server to Cloudflare's edge. No inbound ports needed.",
        why: "Publishes services on a custom domain with zero open ports. Cloudflare sits in front and handles DDoS protection, TLS, and caching. Zero exposure to the raw internet.",
      },
      {
        name: "Cloudflare Access",
        full: "Cloudflare Access",
        acronyms: ["OTP — One-Time Password", "URL — Uniform Resource Locator", "VPN — Virtual Private Network"],
        what: "Zero-trust access control layer. Requires identity verification (e.g. email OTP) before a user can reach a protected URL.",
        why: "Puts Grafana and Umami behind a proper auth gate without exposing them publicly. No credentials stored on the server itself, no VPN needed for the browser.",
      },
      {
        name: "Vaultwarden",
        full: "Vaultwarden (Bitwarden-compatible)",
        what: "A self-hosted password manager server, compatible with all Bitwarden clients.",
        why: "Keeps all credentials off third-party cloud services. I own the data. Running it self-hosted means zero subscription cost and full control over who can access it.",
      },
      {
        name: "SSH",
        full: "Secure Shell",
        acronyms: ["SSH — Secure Shell", "CLI — Command-Line Interface"],
        what: "A cryptographic network protocol for securely accessing a remote machine over an unsecured network. Used via the terminal to run commands on the server.",
        why: "How I manage the homeserver remotely. All SSH access goes through the Tailscale VPN, so the SSH port is never exposed to the public internet — only reachable from trusted devices.",
      },
      {
        name: "SCP",
        full: "Secure Copy Protocol",
        acronyms: ["SCP — Secure Copy Protocol", "SSH — Secure Shell"],
        what: "A command-line tool for transferring files between machines securely over SSH. Uses the same encrypted connection as SSH.",
        why: "Used to copy files to and from the homeserver without needing a GUI or a separate file transfer service. Since it runs over SSH, it inherits the same security — all transfers go through Tailscale and are never exposed to the public internet.",
      },
      {
        name: "TLS / SSL",
        full: "Transport Layer Security / Secure Sockets Layer",
        acronyms: ["TLS — Transport Layer Security", "SSL — Secure Sockets Layer", "HTTPS — HTTP Secure", "HTTP — Hypertext Transfer Protocol"],
        what: "Cryptographic protocols that encrypt data in transit between a client and a server. SSL is the older version; TLS is its modern, more secure successor. HTTPS is HTTP with TLS.",
        why: "All public-facing services use TLS via Cloudflare Tunnel, which handles certificate management automatically. Ensures data between the browser and server cannot be intercepted or tampered with.",
      },
      {
        name: "Zero-Trust",
        full: "Zero-Trust Security Model",
        acronyms: ["VPN — Virtual Private Network"],
        what: "A security model that assumes no user or device should be trusted by default, even inside a private network. Every access request must be verified regardless of origin.",
        why: "The principle behind Cloudflare Access and Tailscale. Rather than assuming everything inside the network is safe, every connection requires verified identity. This means even if one service is compromised, it cannot automatically access others.",
      },
      {
        name: "JWT",
        full: "JSON Web Token",
        acronyms: ["JWT — JSON Web Token", "JSON — JavaScript Object Notation", "API — Application Programming Interface"],
        what: "A compact, self-contained token format used for securely transmitting identity and claims between a client and server. Commonly used for authentication in REST APIs.",
        why: "Used in TaskFlow for user authentication. When a user logs in, the server issues a JWT. The client sends it with every subsequent request so the server knows who is making the call — without storing session state on the server.",
      },
    ],
  },
  {
    id: "infra",
    label: "Infrastructure",
    color: "#3b82f6",
    items: [
      {
        name: "DevOps",
        full: "Development + Operations",
        acronyms: ["DevOps — Development and Operations", "CI/CD — Continuous Integration / Continuous Deployment"],
        what: "A set of practices and culture that combines software development (Dev) and IT operations (Ops) into a single, continuous workflow. The goal is to shorten the cycle between writing code and running it in production.",
        why: "Everything I do on the homeserver is DevOps in practice: writing code, containerising it with Docker, automating deployment with GitHub Actions CI/CD, monitoring with Prometheus and Loki, and maintaining security hardening — all by the same person. It removes the wall between 'I built it' and 'I run it'.",
      },
      {
        name: "Debian Linux",
        full: "Debian Linux",
        what: "A stable, minimal Linux distribution. The operating system the homeserver runs on.",
        why: "Chosen for its rock-solid stability and long release cycles. No bloat, no surprise updates, well-documented. The standard for production servers.",
      },
      {
        name: "Docker",
        full: "Docker",
        what: "Runs applications in isolated containers — each service gets its own environment with its own dependencies.",
        why: "Every service (Nginx, Postgres, the API, Grafana, etc.) runs independently. No dependency conflicts, easy to update or remove one without touching others, and reproducible across machines.",
      },
      {
        name: "Nginx",
        full: "Nginx",
        acronyms: ["TLS — Transport Layer Security", "SSL — Secure Sockets Layer", "HTTP — Hypertext Transfer Protocol", "HTTPS — HTTP Secure"],
        what: "A high-performance web server and reverse proxy.",
        why: "Sits in front of the apps and routes incoming requests to the right container. Also handles TLS termination and serves static files efficiently.",
      },
      {
        name: "GitHub Actions",
        full: "GitHub Actions (CI/CD)",
        acronyms: ["CI/CD — Continuous Integration / Continuous Deployment", "SSH — Secure Shell"],
        what: "Automated pipelines that run on every git push — tests, builds, and deployments.",
        why: "Used for the cv-api project: pushing to main automatically SSHs into the homeserver over Tailscale and rebuilds the Docker stack. Eliminates manual deploys and human error.",
      },
    ],
  },
  {
    id: "observability",
    label: "Observability",
    color: "#f59e0b",
    items: [
      {
        name: "Prometheus",
        full: "Prometheus",
        what: "A metrics collection and time-series database. Scrapes metrics from services at regular intervals.",
        why: "Tracks CPU, memory, container health, uptime, and request rates across the homeserver. Gives a live and historical view of system performance.",
      },
      {
        name: "Loki",
        full: "Grafana Loki",
        what: "A log aggregation system, similar to Elasticsearch but lighter. Stores and indexes log streams.",
        why: "Centralises logs from UFW, Fail2ban, CrowdSec, and Docker containers into one place. Makes it easy to search and correlate events across services — critical for incident investigation.",
      },
      {
        name: "Grafana",
        full: "Grafana",
        what: "A visualisation and dashboarding tool. Connects to Prometheus and Loki to display metrics and logs.",
        why: "Single pane of glass for the entire homeserver. Can see blocked attacks, container health, and web traffic in one place. Protected behind Cloudflare Access.",
      },
      {
        name: "Umami",
        full: "Umami Analytics",
        what: "A self-hosted, privacy-respecting web analytics tool. Tracks page views, visitors, and traffic sources.",
        why: "Gives real visitor data for cv.syamxm.com and other public pages without sending data to Google. GDPR-friendly, lightweight, and I own the data. Also behind Cloudflare Access.",
      },
    ],
  },
  {
    id: "backend",
    label: "Backend & APIs",
    color: "#10b981",
    items: [
      {
        name: "REST API",
        full: "REST API Design",
        acronyms: ["REST — Representational State Transfer", "API — Application Programming Interface", "HTTP — Hypertext Transfer Protocol", "CLI — Command-Line Interface"],
        what: "An architectural style for building web APIs using standard HTTP methods (GET, POST, PUT, DELETE) and stateless requests.",
        why: "The standard way for a frontend and backend to communicate. Every project I've built uses REST — it's predictable, well-understood, and easy to consume from any client (web, mobile, CLI).",
      },
      {
        name: "Node.js",
        full: "Node.js",
        what: "A JavaScript runtime that lets you run JS on the server side, outside the browser.",
        why: "Used in the cv-api and TaskFlow projects. Fast for I/O-heavy work, huge ecosystem via npm, and lets me write both frontend and backend in the same language.",
      },
      {
        name: "Express.js",
        full: "Express.js",
        what: "A minimal web framework for Node.js. Handles routing, middleware, and HTTP request/response logic.",
        why: "The standard choice for building REST APIs in Node. Lightweight, no magic, easy to reason about. Used in cv-api (serves the PostgreSQL-backed CV/resume) and TaskFlow.",
      },
      {
        name: "FastAPI",
        full: "FastAPI (Python)",
        what: "A modern Python web framework for building APIs. Auto-generates OpenAPI docs and uses type hints for validation.",
        why: "Used in the Student Reminder System backend. Python-native so it pairs naturally with data work. Significantly faster than Flask, built-in async support, and the auto-docs are genuinely useful during development.",
      },
      {
        name: "PostgreSQL",
        full: "PostgreSQL",
        what: "A powerful, open-source relational database.",
        why: "Used in cv-api. Chosen over MySQL for its reliability, support for complex queries, and JSON column support. The entire CV content lives in Postgres — a content update is just a SQL change.",
      },
      {
        name: "MongoDB",
        full: "MongoDB",
        what: "A NoSQL document database. Stores data as JSON-like documents instead of tables.",
        why: "Used in TaskFlow (MERN stack). Document model fits task/project data naturally — no rigid schema needed, easy to nest related data. Pairs well with Node.js since everything is already JSON.",
      },
      {
        name: "Redis",
        full: "Redis",
        acronyms: ["CDN — Content Delivery Network", "API — Application Programming Interface"],
        what: "An in-memory key-value store. Extremely fast for caching and rate limiting.",
        why: "Used in the Student Reminder System backend for rate-limiting API requests and caching timetable data. Prevents abuse and avoids hitting the upstream CDN on every request.",
      },
    ],
  },
  {
    id: "frontend",
    label: "Frontend & Mobile",
    color: "#8b5cf6",
    items: [
      {
        name: "React",
        full: "React",
        what: "A JavaScript library for building component-based user interfaces.",
        why: "Used in TaskFlow (MERN stack). Component model keeps UI logic modular and reusable. The standard for web frontends — pairs naturally with Node/Express on the backend.",
      },
      {
        name: "Flutter",
        full: "Flutter",
        what: "Google's UI framework for building cross-platform apps from a single Dart codebase.",
        why: "Used in the Student Reminder System and Family Monitor apps. Write once, deploy to Android and iOS. Dart is easy to pick up, and Flutter's widget system produces polished UIs quickly.",
      },
      {
        name: "MERN Stack",
        full: "MongoDB + Express + React + Node.js",
        acronyms: ["MERN — MongoDB, Express, React, Node.js"],
        what: "A popular full-stack JavaScript combination: MongoDB (database), Express (backend API), React (frontend), Node.js (runtime).",
        why: "Used in TaskFlow. Everything is JavaScript end-to-end — one language across the whole stack. Fast to develop, easy to self-host behind Nginx in Docker.",
      },
      {
        name: "Kotlin / Android",
        full: "Kotlin + Android SDK",
        acronyms: ["SDK — Software Development Kit", "API — Application Programming Interface"],
        what: "Kotlin is the official language for Android development. The Android SDK provides APIs for device features.",
        why: "Used in C-Aegis (Final Year Project). Android-native for full access to the Device Admin API, AccessibilityService, and geofencing — features that a cross-platform framework cannot access deeply enough for a parental monitoring app.",
      },
    ],
  },
];

const allItems = categories.flatMap((c) =>
  c.items.map((item) => ({ ...item, color: c.color, categoryId: c.id, categoryLabel: c.label }))
);

export default function App() {
  const [activeCategory, setActiveCategory] = useState("security");
  const [expandedItem, setExpandedItem] = useState(null);
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const isSearching = query.length > 0;

  const activeItems = isSearching
    ? allItems.filter((item) =>
        [item.name, item.full, item.what, item.why].some((field) =>
          field.toLowerCase().includes(query)
        )
      )
    : allItems.filter((item) => item.categoryId === activeCategory);

  return (
    <div className="page">
      <div className="container">
        <header>
          <p className="kicker">Ahmad Syamim</p>
          <h1 className="title">Stack Helper</h1>
          <p className="subtitle">What everything is, and why I use it.</p>
        </header>

        <div className="intro">
          <p>
            The tools and concepts documented here were not introduced through formal coursework alone. Most were discovered through independent exploration: reading technical documentation, following discussions on communities such as Reddit and YouTube, experimenting directly on a self-hosted Linux server, and increasingly, using AI assistants to accelerate understanding of unfamiliar concepts. Each tool was adopted to solve a real problem — whether securing a public-facing service, automating a deployment, or gaining visibility into a running system. The process of researching, breaking, fixing, and iterating on a live production environment has been the most effective way to internalise how these technologies work and, more importantly, why they exist.
          </p>
        </div>

        <input
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
        />

        {isSearching ? (
          <p className="results-label">
            {activeItems.length} result{activeItems.length !== 1 ? "s" : ""} for "{search}"
          </p>
        ) : (
          <div className="tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`tab${activeCategory === cat.id ? " active" : ""}`}
                style={{ "--cat-color": cat.color }}
                onClick={() => { setActiveCategory(cat.id); setExpandedItem(null); }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        <div className="items">
          {activeItems.map((item) => {
            const isExpanded = expandedItem === item.name;

            return (
              <div
                key={item.name}
                className={`card${isExpanded ? " expanded" : ""}`}
                style={{ "--cat-color": item.color }}
                onClick={() => setExpandedItem(isExpanded ? null : item.name)}
              >
                <div className="card-row">
                  <div className="card-id">
                    <span className="badge">{item.name}</span>
                    {item.full !== item.name && <span className="card-full">{item.full}</span>}
                  </div>
                  <span className="toggle">{isExpanded ? "−" : "+"}</span>
                </div>

                {isExpanded && (
                  <div className="card-body">
                    <div>
                      <p className="section-label">What it is</p>
                      <p className="section-text">{item.what}</p>
                    </div>
                    <div>
                      <p className="section-label">Why I use it</p>
                      <p className="section-text">{item.why}</p>
                    </div>
                    {item.acronyms?.length > 0 && (
                      <div className="acronyms">
                        <p className="section-label">Acronyms</p>
                        <div className="chips">
                          {item.acronyms.map((a) => (
                            <span key={a} className="chip">{a}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {isSearching && (
                      <p className="category-note">Category: {item.categoryLabel}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="footer">
          {allItems.length} tools across {categories.length} categories
        </p>
      </div>
    </div>
  );
}
