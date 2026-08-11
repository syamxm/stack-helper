import { useState } from "react";

const categories = [
  {
    id: "security",
    label: "Security & Network",
    color: "#f38ba8",
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
      {
        name: "httpOnly Cookie",
        full: "httpOnly Cookie Auth",
        acronyms: ["XSS — Cross-Site Scripting", "JWT — JSON Web Token", "CSRF — Cross-Site Request Forgery"],
        what: "A cookie flagged so JavaScript cannot read it. The browser still sends it with every request, but scripts on the page have no access to its value.",
        why: "TaskFlow stores its JWT in an httpOnly cookie rather than localStorage. If an XSS bug ever lands on the page, the attacker's script still cannot steal the token. Paired with SameSite=Strict and Secure so it never leaves over plain HTTP or on cross-site requests.",
      },
      {
        name: "CSRF",
        full: "Cross-Site Request Forgery",
        acronyms: ["CSRF — Cross-Site Request Forgery", "POST — HTTP POST method"],
        what: "An attack where a malicious site tricks a logged-in user's browser into sending a state-changing request to another site. The browser attaches the session cookie automatically, so the request looks legitimate.",
        why: "BeanThere issues a CSRF token on every state-changing POST — placing an order, changing stock, redeeming points. Without it, cookie-based sessions are trivially abusable from any page the user visits while logged in.",
      },
      {
        name: "Rate Limiting",
        full: "Rate Limiting",
        acronyms: ["IP — Internet Protocol"],
        what: "Caps how many requests a client can make in a time window, rejecting the excess.",
        why: "Different routes need different limits. TaskFlow rate-limits login separately from registration; BeanThere limits login per username+IP and per IP; the metrics API is capped at 60 requests/minute per IP in nginx. Fail2ban stops the slow brute-force — rate limiting stops the fast one before it reaches the app.",
      },
      {
        name: "bcrypt",
        full: "bcrypt",
        acronyms: ["CPU — Central Processing Unit"],
        what: "A password hashing function that is deliberately slow and salts every hash. The cost factor controls how much CPU work each hash takes.",
        why: "Used in TaskFlow, Cipher Forge, and BeanThere. Passwords are never stored — only their hashes. The slowness is the feature: it makes offline cracking of a leaked database expensive. BeanThere also re-hashes on login when PHP's default cost increases.",
      },
      {
        name: "Prepared Statements",
        full: "Prepared Statements",
        acronyms: ["SQL — Structured Query Language", "SQLi — SQL Injection"],
        what: "Sending the SQL query and its parameters to the database separately, so user input is always treated as a value and never as executable SQL.",
        why: "The fix for SQL injection. BeanThere uses them for every single query — no request input is ever string-concatenated into SQL anywhere in the codebase. Semgrep in the pipeline flags it if that ever slips.",
      },
      {
        name: "Security Headers",
        full: "HTTP Security Headers",
        acronyms: ["CSP — Content Security Policy", "HSTS — HTTP Strict Transport Security", "MIME — Multipurpose Internet Mail Extensions"],
        what: "Response headers that instruct the browser to enforce restrictions: CSP controls which scripts and resources may load, HSTS forces HTTPS, X-Frame-Options blocks framing, and X-Content-Type-Options stops MIME sniffing.",
        why: "Set in nginx for TaskFlow, resume-builder, and BeanThere. BeanThere runs default-src 'self' — the site makes zero third-party requests, so the policy can be strict rather than permissive. Defence that costs nothing at runtime.",
      },
      {
        name: "IDOR",
        full: "Insecure Direct Object Reference",
        acronyms: ["IDOR — Insecure Direct Object Reference", "ID — Identifier"],
        what: "A flaw where changing an ID in a request lets you read or modify someone else's data, because the server checks that the record exists but not that you own it.",
        why: "Every project and task query in TaskFlow is scoped to the owner in the database query itself, not checked afterwards. Guessing another user's project ID returns nothing rather than their board.",
      },
      {
        name: "Mass Assignment",
        full: "Mass Assignment",
        what: "A flaw where a request body is passed straight into a database update, letting an attacker set fields the form never exposed — a role, an owner ID, a price.",
        why: "TaskFlow whitelists which fields an update route may touch instead of forwarding the whole request body. Same class of bug as NoSQL operator injection, same fix: never trust the shape of the input.",
      },
      {
        name: "Input Validation",
        full: "Input Validation",
        what: "Checking that incoming data matches an expected type, length, format, and set of allowed values before anything is done with it.",
        why: "express-validator on every write route in TaskFlow, Pydantic models in the FastAPI projects. Rejecting bad input at the boundary means the rest of the code can assume the data is sane — far simpler than defending at every layer.",
      },
      {
        name: "WireGuard",
        full: "WireGuard",
        acronyms: ["VPN — Virtual Private Network", "UDP — User Datagram Protocol"],
        what: "A modern VPN protocol built into the Linux kernel. Small codebase, modern cryptography, no configuration negotiation — each peer just knows the others' public keys.",
        why: "The protocol underneath Tailscale. Worth knowing separately because Tailscale is the convenience layer: it handles key exchange and NAT traversal, while WireGuard does the actual encrypted tunnelling.",
      },
    ],
  },
  {
    id: "crypto",
    label: "Cryptography",
    color: "#cba6f7",
    items: [
      {
        name: "RSA",
        full: "Rivest–Shamir–Adleman",
        acronyms: ["RSA — Rivest–Shamir–Adleman"],
        what: "The classic public-key algorithm. Two large primes generate a public key (n, e) used to encrypt and a private key (d) used to decrypt. Its security rests on factoring n being infeasible when the primes are large.",
        why: "The subject of two UiTM course projects. Cipher Agent is a terminal spy game where you encrypt in blocks using a friend's public key — and because its n is deliberately small, the game recovers d at runtime by factoring it, which demonstrates exactly why real keys are 2048 bits.",
      },
      {
        name: "Public-Key Crypto",
        full: "Asymmetric Cryptography",
        what: "Encryption using a key pair: anyone can encrypt with the public key, but only the holder of the private key can decrypt. No shared secret needs to be exchanged in advance.",
        why: "The idea that makes TLS, SSH keys, and WireGuard possible. Symmetric encryption is faster, but it has a chicken-and-egg problem: you need a secure channel to agree on the key. Asymmetric crypto solves the bootstrap.",
      },
      {
        name: "One-Time Pad",
        full: "One-Time Pad",
        acronyms: ["XOR — Exclusive OR"],
        what: "Encryption by XOR-ing the message with random key material as long as the message. Provably unbreakable — but only if the pad is truly random, kept secret, and never reused.",
        why: "The two-player field channel in Cipher Agent. Every message consumes fresh pad bytes that are never reused, because reusing a pad instantly leaks the relationship between two messages. A good demonstration of how a perfect algorithm still fails on key management.",
      },
      {
        name: "AES-256-GCM",
        full: "Advanced Encryption Standard, Galois/Counter Mode",
        acronyms: ["AES — Advanced Encryption Standard", "GCM — Galois/Counter Mode"],
        what: "The standard symmetric cipher, in a mode that both encrypts and authenticates — tampering with the ciphertext is detected on decryption rather than silently producing garbage.",
        why: "TaskFlow encrypts stored GitHub tokens with it. A user's token is a credential to someone else's account, so it cannot sit in the database in plaintext. Authenticated encryption is chosen over plain AES so a modified record fails loudly.",
      },
      {
        name: "Hashing vs Encryption",
        full: "Hashing vs Encryption",
        what: "Encryption is reversible with a key. Hashing is one-way by design — there is no operation that turns a hash back into the original.",
        why: "The distinction decides how data is stored. Passwords are hashed with bcrypt because nothing should ever need to read them back. GitHub tokens are encrypted with AES because the server genuinely has to send them to GitHub later. Getting this backwards is one of the most common security bugs.",
      },
    ],
  },
  {
    id: "infra",
    label: "Infrastructure",
    color: "#89b4fa",
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
      {
        name: "Git / GitHub",
        full: "Git + GitHub",
        acronyms: ["VCS — Version Control System"],
        what: "Git is the distributed version-control system that tracks every change to the code; GitHub is the hosted platform where the repositories live and where the CI/CD pipelines run.",
        why: "The backbone of every project and the trigger for the whole pipeline — a push to GitHub is what kicks off CI/CD. Branching keeps features isolated, and the full history makes any change reversible.",
      },
      {
        name: "Docker Compose",
        full: "Docker Compose",
        acronyms: ["YAML — YAML Ain't Markup Language"],
        what: "Describes a multi-container application — its services, networks, volumes, and environment — in a single YAML file, brought up with one command.",
        why: "Every project on the server is a compose file. It is also where the security boundaries live: which containers sit on the internal network, which one is allowed on proxy-net, and which ports are published to the host. The file is the deployment documentation.",
      },
      {
        name: "Multi-Stage Build",
        full: "Multi-Stage Docker Build",
        acronyms: ["CVE — Common Vulnerabilities and Exposures"],
        what: "A Dockerfile with several FROM stages, where the final image copies only the build output from the earlier stages. Compilers, dev dependencies, and source code stay behind.",
        why: "The TaskFlow and resume-builder frontends build with Node and ship as static files in an nginx image. The runtime image has no npm, no toolchain, and no source — a smaller image with far fewer CVEs for Trivy to find.",
      },
      {
        name: "Non-Root Containers",
        full: "Non-Root Containers",
        acronyms: ["UID — User Identifier"],
        what: "Running the process inside a container as an unprivileged user instead of root, so a container breakout starts from a much weaker position.",
        why: "The TaskFlow backend runs as the node user; both frontends use nginx-unprivileged. Containers are not a security boundary on their own, so the process inside should not be root either. Hadolint flags it in the pipeline when a Dockerfile forgets.",
      },
      {
        name: "GHCR",
        full: "GitHub Container Registry",
        acronyms: ["GHCR — GitHub Container Registry"],
        what: "A container image registry hosted alongside the GitHub repository. CI pushes built images to it; servers pull from it.",
        why: "resume-builder deploys by pulling prebuilt GHCR images rather than building on the homeserver. The exact image that passed the security scans is the image that runs — and the server does not need a build toolchain or the source code at all.",
      },
      {
        name: "Docker Socket Proxy",
        full: "Docker Socket Proxy",
        acronyms: ["API — Application Programming Interface"],
        what: "A small proxy in front of the Docker socket that allows only specific read-only API calls through.",
        why: "The metrics API needs per-container CPU and memory. Mounting the Docker socket directly would give it root over the whole host, so it talks to a proxy with CONTAINERS=1 and POST=0 instead. Least privilege applied to a container that only needs to look.",
      },
      {
        name: "Apache",
        full: "Apache HTTP Server",
        acronyms: ["PHP — PHP: Hypertext Preprocessor"],
        what: "The long-established web server, using a module-based architecture — mod_php runs PHP inside the server process itself.",
        why: "Serves BeanThere, which is plain PHP with no framework. Nginx still sits in front as the reverse proxy; Apache only handles the PHP application behind it.",
      },
      {
        name: "systemd",
        full: "systemd",
        what: "The Linux init system and service manager. A unit file declares how a service starts, when it starts, and what happens if it dies.",
        why: "How anything that isn't a container stays running on the server, including the server-mode toggle script. Restart policies and boot ordering are handled by the OS rather than by hand.",
      },
      {
        name: "Cron",
        full: "Cron",
        what: "The Unix job scheduler — runs a command on a fixed schedule defined by a crontab entry.",
        why: "Drives the recurring work on the server: BeanThere's demo order progression and monthly voucher grants, plus backup and maintenance scripts. Boring, ancient, and completely reliable.",
      },
      {
        name: "Maven",
        full: "Apache Maven",
        acronyms: ["JAR — Java Archive", "XML — Extensible Markup Language"],
        what: "The Java build and dependency tool. A pom.xml declares dependencies and plugins; Maven resolves, compiles, tests, and packages the JAR.",
        why: "Builds cv-api-spring. Comes with the wrapper (mvnw) committed to the repo, so CI and the Docker build use the exact same Maven version I do locally.",
      },
    ],
  },
  {
    id: "devsecops",
    label: "DevSecOps & CI/CD",
    color: "#fab387",
    items: [
      {
        name: "CI",
        full: "Continuous Integration",
        acronyms: ["CI — Continuous Integration", "CI/CD — Continuous Integration / Continuous Delivery"],
        what: "The practice of automatically building and testing every code change as soon as it's pushed, so problems are caught early instead of piling up. Each push triggers the pipeline to lint, test, and scan the new code.",
        why: "Means I never merge code that breaks the build or fails a scan. On TaskFlow and cv-api, every push to GitHub runs the checks automatically — if something fails I know within minutes, not after deploy.",
      },
      {
        name: "CD",
        full: "Continuous Delivery / Deployment",
        acronyms: ["CD — Continuous Delivery / Continuous Deployment", "SSH — Secure Shell"],
        what: "The half of the pipeline that ships code which passed CI. Continuous Delivery keeps every change ready to release; Continuous Deployment goes further and pushes it to production automatically once all checks pass.",
        why: "Removes manual deploys and the human error that comes with them. On cv-api, a passing pipeline SSHs into the homeserver over Tailscale and rebuilds the Docker stack on its own — I push code, and the live site updates itself.",
      },
      {
        name: "DevSecOps",
        full: "Development + Security + Operations",
        acronyms: ["DevSecOps — Development, Security, and Operations", "SAST — Static Application Security Testing", "DAST — Dynamic Application Security Testing"],
        what: "DevOps with security built into every stage rather than bolted on at the end — often called 'shift left'. Security scanning runs inside the pipeline, so vulnerabilities are caught while code is being written, not after release.",
        why: "It's the focus of my work. Instead of treating security as a final audit, I gate the whole CI/CD pipeline on it: secrets, code, dependencies, containers, and the running app are all scanned automatically before anything reaches production.",
      },
      {
        name: "Security-Gated Pipeline",
        full: "Security-Gated CI/CD Pipeline",
        acronyms: ["CI/CD — Continuous Integration / Continuous Delivery", "SAST — Static Application Security Testing", "DAST — Dynamic Application Security Testing", "SCA — Software Composition Analysis", "IaC — Infrastructure as Code", "SBOM — Software Bill of Materials"],
        what: "A CI/CD pipeline that blocks deployment whenever a scan reports a HIGH or CRITICAL finding. In TaskFlow, reusable GitHub Actions workflows run 8 scanners covering secrets, code, dependencies, Dockerfiles, IaC, container images, and the live app.",
        why: "A passing test suite doesn't mean code is safe to ship. The gate makes security non-negotiable — if Gitleaks finds a secret or Trivy finds a critical CVE, the deploy simply stops. Nothing vulnerable reaches production by accident.",
      },
      {
        name: "Gitleaks",
        full: "Gitleaks",
        what: "Scans the codebase and full git history for hardcoded secrets — API keys, tokens, and passwords that should never be committed.",
        why: "A leaked credential in a commit is one of the easiest ways to get compromised. Gitleaks runs first in the TaskFlow pipeline, so a committed secret stops the build immediately.",
      },
      {
        name: "SAST",
        full: "Static Application Security Testing (Semgrep)",
        acronyms: ["SAST — Static Application Security Testing", "CVE — Common Vulnerabilities and Exposures"],
        what: "Scans source code without running it, looking for insecure patterns like injection flaws, unsafe functions, and hardcoded secrets. I use Semgrep as the engine.",
        why: "Catches vulnerabilities in my own code before it ever runs. Runs on every push in TaskFlow and blocks the deploy on high-severity findings.",
      },
      {
        name: "npm audit",
        full: "npm audit",
        acronyms: ["SCA — Software Composition Analysis", "CVE — Common Vulnerabilities and Exposures"],
        what: "Node's built-in dependency scanner. Checks every installed npm package against a database of known vulnerabilities.",
        why: "A fast, zero-setup first pass over Node dependencies in the pipeline, running alongside Trivy. Free and already part of the toolchain.",
      },
      {
        name: "Trivy",
        full: "Trivy (SCA / Image / IaC)",
        acronyms: ["SCA — Software Composition Analysis", "IaC — Infrastructure as Code", "CVE — Common Vulnerabilities and Exposures", "SBOM — Software Bill of Materials"],
        what: "An all-in-one scanner for dependencies, container images, and infrastructure-as-code and config files. Flags known CVEs and misconfigurations.",
        why: "One tool covers several layers of the TaskFlow pipeline at once — it scans dependencies, the built Docker image, and config, and generates the CycloneDX SBOM. Blocks deploy on HIGH or CRITICAL CVEs.",
      },
      {
        name: "Hadolint",
        full: "Hadolint (Dockerfile linter)",
        what: "A linter for Dockerfiles. Flags bad practices like running as root, unpinned base-image versions, and inefficient layers.",
        why: "Keeps my container images secure and lean by enforcing Dockerfile best practices automatically, as part of the pipeline's container-hardening checks.",
      },
      {
        name: "SBOM",
        full: "Software Bill of Materials (CycloneDX)",
        acronyms: ["SBOM — Software Bill of Materials"],
        what: "A complete inventory of every dependency and component that goes into a build, generated in the CycloneDX format — like an ingredients list for the software.",
        why: "When a new CVE drops, an SBOM lets me instantly check whether my app ships the affected package. Trivy generates one for every TaskFlow image build.",
      },
      {
        name: "DAST",
        full: "Dynamic Application Security Testing (OWASP ZAP)",
        acronyms: ["DAST — Dynamic Application Security Testing", "OWASP — Open Worldwide Application Security Project"],
        what: "Tests the running application from the outside, the way an attacker would — probing live endpoints for vulnerabilities. I use the OWASP ZAP baseline scan.",
        why: "SAST reads the code; DAST actually attacks the running app. Together they cover both what the code says and how it behaves at runtime. The ZAP baseline runs against TaskFlow in the pipeline.",
      },
      {
        name: "Dependabot",
        full: "Dependabot",
        acronyms: ["CVE — Common Vulnerabilities and Exposures"],
        what: "A GitHub bot that watches dependencies and base images for outdated or vulnerable versions and opens pull requests to update them automatically.",
        why: "Keeps TaskFlow's dependencies and Docker base images current without me checking by hand. Most dependency CVEs are fixed just by staying up to date — Dependabot does that legwork.",
      },
      {
        name: "Nmap",
        full: "Network Mapper",
        acronyms: ["IP — Internet Protocol"],
        what: "A network scanner that discovers open ports and the services running behind them. The standard tool for mapping what a machine exposes.",
        why: "I use it to check the homeserver's attack surface from the outside — confirming that the hardening (UFW, Cloudflare Tunnel, Tailscale) really does leave zero unexpected ports open.",
      },
      {
        name: "Linting",
        full: "Linting (ESLint, Ruff, php -l)",
        what: "Static analysis that flags unused variables, unreachable branches, dangerous patterns, and style drift before the code ever runs.",
        why: "ESLint on the JavaScript projects, Ruff on the Python ones, php -l as BeanThere's first CI gate. It is the cheapest stage in the pipeline, so it runs first — no point scanning for CVEs in code that doesn't parse.",
      },
      {
        name: "Unit Testing",
        full: "Unit Testing (pytest)",
        what: "Small automated tests that exercise one piece of code in isolation and fail the build when its behaviour changes unexpectedly.",
        why: "pytest covers the Cipher Agent RSA logic and Switchboard's flag handling. Tests matter most where the logic is easy to get subtly wrong and hard to eyeball — key generation and state files both qualify.",
      },
      {
        name: "Concurrency Lock",
        full: "Deploy Concurrency Lock",
        what: "A GitHub Actions setting that allows only one run of a given job at a time, queueing or cancelling the rest.",
        why: "TaskFlow serialises its deploy job behind a deploy-production lock. Two pushes landing close together would otherwise SSH into the same server and run docker compose simultaneously, leaving the stack in whichever half-state won the race.",
      },
    ],
  },
  {
    id: "observability",
    label: "Observability",
    color: "#f9e2af",
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
      {
        name: "node_exporter",
        full: "Prometheus Node Exporter",
        acronyms: ["CPU — Central Processing Unit", "RAM — Random Access Memory", "I/O — Input/Output"],
        what: "An agent that reads the host's hardware and OS metrics from /proc and /sys and exposes them for Prometheus to scrape: CPU, memory, disk, filesystem, temperatures, network.",
        why: "The source behind every host panel in Grafana and the btop-style panel on my portfolio. It only sees its own container's network namespace, though — which is why the metrics API reads host NIC counters from a bind-mounted /proc/1/net/dev instead.",
      },
      {
        name: "Promtail",
        full: "Promtail",
        what: "Loki's log shipper. Tails log files on the host, labels each stream, and pushes the lines to Loki.",
        why: "Loki stores and queries logs but does not collect them. Promtail is what actually reads auth.log, the UFW logs, and the Fail2ban logs off the homeserver — so a blocked attack shows up in Grafana next to the CPU graph.",
      },
    ],
  },
  {
    id: "backend",
    label: "Backend & APIs",
    color: "#a6e3a1",
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
      {
        name: "Firebase",
        full: "Google Firebase",
        acronyms: ["BaaS — Backend as a Service", "SDK — Software Development Kit"],
        what: "Google's backend-as-a-service platform — managed authentication, a realtime document database (Firestore), and cloud messaging, all reached through client SDKs.",
        why: "Used in C-Aegis (Final Year Project) for authentication and realtime data sync between the parent and child apps. Lets a mobile app have a secure backend without running a server.",
      },
      {
        name: "MariaDB",
        full: "MariaDB",
        acronyms: ["SQL — Structured Query Language"],
        what: "A community-maintained fork of MySQL, drop-in compatible with it.",
        why: "The database behind BeanThere — menu, orders, loyalty points, and vouchers. MySQL-compatible because plain PHP's tooling assumes it, and it runs happily in a small container next to the app.",
      },
      {
        name: "Spring Boot",
        full: "Spring Boot",
        acronyms: ["JVM — Java Virtual Machine", "DI — Dependency Injection"],
        what: "The convention-over-configuration layer on top of the Spring framework. Auto-configures the server, data access, and security so an application starts from a single main method.",
        why: "Runs cv-api-spring — a deliberate reimplementation of my Node/Express cv-api, built to learn the Spring ecosystem rather than to fix anything. Its JSON responses are byte-for-byte identical to the Node version, so I can diff the two and prove nothing drifted.",
      },
      {
        name: "JPA / Hibernate",
        full: "Jakarta Persistence API / Hibernate",
        acronyms: ["JPA — Jakarta Persistence API", "ORM — Object-Relational Mapping"],
        what: "JPA is the Java standard for mapping database rows to objects; Hibernate is the implementation Spring Boot uses by default.",
        why: "Maps the cv-api-spring CV tables onto entities. Entities stay behind the service layer and DTOs are what cross the boundary — otherwise the database schema quietly becomes the public API contract.",
      },
      {
        name: "SQLAlchemy",
        full: "SQLAlchemy 2.0",
        acronyms: ["ORM — Object-Relational Mapping"],
        what: "Python's ORM and SQL toolkit. Models are Python classes; queries are composed in Python and compiled to SQL.",
        why: "The data layer of resume-builder over PostgreSQL. Parameterisation is the default, so the SQL injection class of bug largely disappears — and dropping to raw SQL is still there when a query needs it.",
      },
      {
        name: "Migrations",
        full: "Database Migrations (Flyway, Alembic)",
        acronyms: ["DDL — Data Definition Language"],
        what: "Versioned, ordered scripts that evolve a database schema. Each one runs exactly once and is recorded, so every environment converges on the same structure.",
        why: "Flyway in cv-api-spring, Alembic in resume-builder. A schema change is a committed file reviewed like any other code, instead of a command someone ran on production and forgot about. Rebuilding the database from scratch stays reproducible.",
      },
      {
        name: "Pydantic",
        full: "Pydantic",
        what: "Python's data validation library. A model declares the expected fields and types; anything that doesn't match is rejected with a clear error.",
        why: "How every FastAPI project validates input at the boundary. The request body is parsed into a typed model or fails with a 422 — the endpoint never sees malformed data, and the OpenAPI schema is generated from the same models.",
      },
      {
        name: "Uvicorn / ASGI",
        full: "Uvicorn + ASGI",
        acronyms: ["ASGI — Asynchronous Server Gateway Interface", "WSGI — Web Server Gateway Interface"],
        what: "ASGI is the async successor to WSGI — the interface between a Python web app and its server. Uvicorn is the ASGI server that actually runs the application.",
        why: "Runs FastAPI in Cipher Agent, Cipher Forge, Switchboard, resume-builder, and the metrics API. Async matters where the work is waiting rather than computing: Switchboard polling site health and the metrics API scraping Prometheus both spend their time on I/O.",
      },
      {
        name: "Motor",
        full: "Motor (async MongoDB driver)",
        what: "The asynchronous MongoDB driver for Python, designed for asyncio applications.",
        why: "Cipher Forge stores accounts and leaderboard scores in MongoDB from FastAPI. The standard driver blocks the event loop; Motor doesn't, which is the whole point of running on ASGI.",
      },
      {
        name: "OpenAPI / Swagger",
        full: "OpenAPI Specification / Swagger UI",
        acronyms: ["API — Application Programming Interface"],
        what: "A machine-readable description of an HTTP API — its routes, parameters, and response shapes. Swagger UI renders it as browsable, testable documentation.",
        why: "Generated automatically by FastAPI and exposed at /swagger-ui.html in cv-api-spring. Because it is derived from the code rather than written alongside it, the docs cannot drift out of date.",
      },
      {
        name: "Ollama",
        full: "Ollama (local LLM runtime)",
        acronyms: ["LLM — Large Language Model", "GPU — Graphics Processing Unit", "VRAM — Video RAM"],
        what: "Runs open-weight language models locally, exposing them over a small HTTP API. No external service and no data leaving the machine.",
        why: "BeanThere's drink recommender runs qwen2.5:3b on the host GPU — a 3B model because there are only 4 GB of VRAM to work with. It sits behind a rule-based fallback, so the chatbot still answers when the model is down or the rate limit is hit. Self-hosted AI has to fail gracefully.",
      },
    ],
  },
  {
    id: "frontend",
    label: "Frontend & Mobile",
    color: "#94e2d5",
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
      {
        name: "Vite",
        full: "Vite",
        acronyms: ["ESM — ECMAScript Modules", "HMR — Hot Module Replacement"],
        what: "The build tool behind the React projects. Serves native ES modules with hot reload in development, and bundles a minified, hashed production build.",
        why: "Builds this site, TaskFlow, Cipher Forge, and resume-builder. The output is plain static files, so deployment is just copying dist/ into an nginx image — no Node runtime in production.",
      },
      {
        name: "Tailwind CSS",
        full: "Tailwind CSS",
        acronyms: ["CSS — Cascading Style Sheets"],
        what: "A utility-first CSS framework. Styling is composed from small single-purpose classes in the markup, and the build strips every class the project never uses.",
        why: "Used in TaskFlow and BeanThere, where it is compiled at image build time so no CDN request is needed — which is what lets BeanThere run a strict default-src 'self' CSP. This site is hand-written CSS instead, because its design follows syamxm.com rather than a utility system.",
      },
      {
        name: "Chart.js",
        full: "Chart.js",
        what: "A canvas-based charting library for line, bar, and pie charts.",
        why: "Renders BeanThere's admin analytics — sales over time, popular items, order volume. Self-hosted rather than loaded from a CDN, for the same CSP reason as Tailwind.",
      },
    ],
  },
  {
    id: "languages",
    label: "Languages",
    color: "#b4befe",
    items: [
      {
        name: "JavaScript",
        full: "JavaScript",
        what: "The language of the web — it runs in every browser and, through Node.js, on the server too.",
        why: "My primary language. Powers the React frontends and the Node/Express backends in cv-api and TaskFlow — one language across the whole stack.",
      },
      {
        name: "Python",
        full: "Python",
        what: "A readable, general-purpose language strong in scripting, automation, and backend work.",
        why: "Used for the FastAPI backend in the Student Reminder System and for quick automation scripts on the homeserver.",
      },
      {
        name: "Java",
        full: "Java",
        acronyms: ["JVM — Java Virtual Machine", "OOP — Object-Oriented Programming"],
        what: "A statically-typed, object-oriented language that runs on the JVM.",
        why: "The foundation language from coursework and the base that Kotlin and Android build on. Used it to write the Enigma-Java cipher CLI.",
      },
      {
        name: "Kotlin",
        full: "Kotlin",
        acronyms: ["JVM — Java Virtual Machine", "SDK — Software Development Kit"],
        what: "A modern JVM language and the official choice for Android development — more concise and null-safe than Java.",
        why: "Used in C-Aegis for native Android. Keeps full access to the Android SDK while cutting the boilerplate Java needs.",
      },
      {
        name: "Dart",
        full: "Dart",
        what: "The language behind Flutter, designed for building cross-platform user interfaces.",
        why: "Used across the Flutter apps (Student Reminder System, Family Monitor). One Dart codebase compiles to both Android and iOS.",
      },
      {
        name: "SQL",
        full: "Structured Query Language",
        acronyms: ["SQL — Structured Query Language"],
        what: "The query language for relational databases — defining schemas and reading and writing data.",
        why: "Drives the PostgreSQL behind cv-api: the entire CV is data, so a content update is just a SQL change.",
      },
      {
        name: "Bash",
        full: "Bash",
        acronyms: ["CLI — Command-Line Interface"],
        what: "The default Unix shell scripting language for automating command-line tasks.",
        why: "The glue on the homeserver — deployment steps, backups, and maintenance scripts that tie Docker, Nginx, and the security stack together.",
      },
      {
        name: "HTML / CSS",
        full: "HTML + CSS",
        acronyms: ["HTML — Hypertext Markup Language", "CSS — Cascading Style Sheets"],
        what: "The markup and styling languages that structure and style every web page.",
        why: "The foundation under React. Hand-written across this site and the cv-api frontend for layout, theming, and the self-hosted JetBrains Mono typography.",
      },
      {
        name: "TypeScript",
        full: "TypeScript",
        what: "JavaScript with static types, checked at build time and erased at runtime.",
        why: "The resume-builder frontend. Types earn their keep once an API response is passed through several components — a renamed field becomes a build error instead of undefined appearing somewhere on the page.",
      },
      {
        name: "PHP",
        full: "PHP: Hypertext Preprocessor",
        acronyms: ["PHP — PHP: Hypertext Preprocessor"],
        what: "A server-side scripting language built for the web, embedded directly in HTML templates and executed per request.",
        why: "BeanThere is PHP 8.2 with no framework, on purpose. Without a framework handling CSRF tokens, prepared statements, session hardening, and rate limiting for me, I had to write each one and understand exactly what it defends against.",
      },
      {
        name: "C",
        full: "C",
        acronyms: ["WMI — Windows Management Instrumentation", "ACPI — Advanced Configuration and Power Interface"],
        what: "The systems language Linux itself is written in. Direct memory access, no runtime, and no garbage collector.",
        why: "acer-wmi-battery is a Linux kernel module in C that exposes my laptop's battery charge limit through the vendor's ACPI-WMI interface. Kernel code is a different discipline from web work: no standard library, and a mistake takes down the machine rather than a request.",
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
        <section className="window">
          <div className="window-bar">
            <div className="dots"><span /><span /><span /></div>
            <span className="window-title">stack-helper — syamxm@homeserver</span>
          </div>
          <div className="window-body">
            <p className="kicker">Ahmad Syamim</p>
            <h1 className="title">Stack Helper</h1>
            <p className="subtitle">What everything is, and why I use it.</p>
            <p className="intro">
            The tools and concepts documented here were not introduced through formal coursework alone. Most were discovered through independent exploration: reading technical documentation, following discussions on communities such as Reddit and YouTube, experimenting directly on a self-hosted Linux server, and increasingly, using AI assistants to accelerate understanding of unfamiliar concepts. Each tool was adopted to solve a real problem — whether securing a public-facing service, automating a deployment, or gaining visibility into a running system. The process of researching, breaking, fixing, and iterating on a live production environment has been the most effective way to internalise how these technologies work and, more importantly, why they exist.
            </p>
          </div>
        </section>

        <div className="prompt">
          <span className="prompt-label">~/stack $</span>
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search tools..."
          />
        </div>

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
                    <span className="marker">{isExpanded ? "▾" : "▸"}</span>
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
