"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { signIn, signUp, signOut } from "@/app/auth-actions";

interface LandingPageProps {
  initialUser: any;
  initialTodos: any[];
}

export default function LandingPage({ initialUser, initialTodos }: LandingPageProps) {
  // Authentication states
  const [user, setUser] = useState<any>(initialUser);
  const [todos, setTodos] = useState<any[]>(initialTodos);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll header styling state
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  // Customizer selections states
  const [batter, setBatter] = useState("classic");
  const [filling, setFilling] = useState("Classic Masala");
  const [addons, setAddons] = useState<{ [key: string]: boolean }>({
    gunpowder: false,
    sambar: false,
  });

  // Simulator modal states
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [flightPhase, setFlightPhase] = useState<"loading" | "success">("loading");
  const [flightProgress, setFlightProgress] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<{ text: string; type?: string }[]>([]);

  // Supabase client instance
  const supabase = createClient();

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync initial props (supports server-side revalidation changes)
  useEffect(() => {
    setUser(initialUser);
    setTodos(initialTodos);
  }, [initialUser, initialTodos]);

  // Fetch updated flight logs from Supabase
  const refreshFlights = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("todos")
      .select()
      .order("id", { ascending: false });
    if (data) {
      setTodos(data);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    const res = await signOut();
    if (res.success) {
      setUser(null);
      setTodos([]);
      setAuthSuccess("Logged out successfully.");
      setTimeout(() => setAuthSuccess(null), 3000);
    }
  };

  // Sign in & Sign up form submit
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      if (authTab === "signin") {
        const res = await signIn(formData);
        if (res.success) {
          // Re-fetch current user immediately
          const { data } = await supabase.auth.getUser();
          setUser(data.user);
          setIsAuthModalOpen(false);
          setEmail("");
          setPassword("");
          // Refresh flight history lists
          const { data: list } = await supabase
            .from("todos")
            .select()
            .order("id", { ascending: false });
          if (list) setTodos(list);
        } else {
          setAuthError(res.error || "Failed to sign in.");
        }
      } else {
        const res = await signUp(formData);
        if (res.success) {
          setAuthSuccess("Sign up successful! Please check your email for confirmation or Sign In.");
          setAuthTab("signin");
        } else {
          setAuthError(res.error || "Failed to sign up.");
        }
      }
    });
  };

  // Calculate pricing summary
  const getPriceAndConfig = () => {
    let basePrice = 129;
    if (batter === "rava") basePrice += 20;
    if (batter === "charcoal") basePrice += 30;
    if (filling === "Paneer Tikka") basePrice += 40;
    if (filling === "Cheese Schezwan") basePrice += 50;

    const activeAddons: string[] = [];
    if (addons.gunpowder) {
      basePrice += 15;
      activeAddons.push("Gunpowder");
    }
    if (addons.sambar) {
      basePrice += 10;
      activeAddons.push("Extra Sambar");
    }

    const batterLabel = batter.charAt(0).toUpperCase() + batter.slice(1);
    const configName = `${batterLabel} Dosa w/ ${filling} ${
      activeAddons.length > 0 ? "(" + activeAddons.join(" + ") + ")" : ""
    }`;

    return { price: basePrice, name: configName };
  };

  // Drone Launch Simulator simulation logic
  const handleLaunchSimulator = () => {
    if (!user) {
      // Prompt sign-in
      setAuthError("Authentication required. Please sign in to launch drone flight.");
      setAuthTab("signin");
      setIsAuthModalOpen(true);
      return;
    }

    // Reset simulator UI
    setFlightPhase("loading");
    setFlightProgress(0);
    setConsoleLogs([]);
    setIsFlightModalOpen(true);

    const logs = [
      { t: 0, text: "[SYS] Initializing launch systems..." },
      { t: 600, text: "[PAYLOAD] Calibrating 3-axis gyro-stabilization cell." },
      { t: 1200, text: "[THERMAL] Activating core heaters... Stable at 75°C.", type: "saffron" },
      { t: 1800, text: "[DRONE] Battery at 98%. AI navigation node locking GPS coordinates." },
      { t: 2400, text: "[SYS] LAUNCH AUTHORIZED. Launching Drone #AD-492..." },
      { t: 3000, text: "[DRONE] Speed: 40km/h. Altitude: 35m. Ascending.", type: "saffron" },
      { t: 3800, text: "[NAV] Navigating high-speed corridor sector 4. Wind currents favorable." },
      { t: 4500, text: "[DRONE] Speed: 120km/h. Altitude: 120m. Cruising." },
      { t: 5200, text: "[PAYLOAD] Sambar status: Spill level 0.00%. Auto-balancing active." },
      { t: 5900, text: "[NAV] Final descent phase initiated. Destination: Balcony #14.", type: "saffron" },
      { t: 6600, text: "[DRONE] Hovering at target coords. Altitude: 8m. Winch system engaged." },
      { t: 7200, text: "[DELIVERY] Depositing thermal capsule. Contact confirmed.", type: "success" },
      { t: 7800, text: "[SYS] Payload decoupled. Return home code initialized." },
    ];

    logs.forEach((log) => {
      setTimeout(() => {
        setConsoleLogs((prev) => [...prev, { text: log.text, type: log.type }]);
      }, log.t);
    });

    const flightDuration = 8000;
    const intervalTime = 100;
    const totalSteps = flightDuration / intervalTime;
    let currentStep = 0;

    const progressInterval = setInterval(async () => {
      currentStep++;
      const progressRatio = currentStep / totalSteps;
      setFlightProgress(progressRatio * 100);

      if (currentStep >= totalSteps) {
        clearInterval(progressInterval);
        
        // Flight successfully completed! Record this in the Supabase 'todos' table
        const config = getPriceAndConfig();
        try {
          await supabase.from("todos").insert([
            { name: `Flight Config: ${config.name} - Fee Paid: ₹${config.price}` }
          ]);
          // Refresh flight history list
          await refreshFlights();
        } catch (err) {
          console.error("DB log error: ", err);
        }

        setTimeout(() => {
          setFlightPhase("success");
        }, 800);
      }
    }, intervalTime);
  };

  const { price, name: summaryName } = getPriceAndConfig();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Decorative Orbs */}
      <div className="bg-orb orb-saffron" />
      <div className="bg-orb orb-teal" />
      <div className="bg-orb orb-gold" />

      {/* Navigation Header */}
      <header className={isHeaderScrolled ? "scrolled" : ""}>
        <div className="container">
          <nav>
            <a href="#" className="brand">
              <div className="brand-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <span className="brand-name">AirDosa</span>
            </a>

            <ul className={`nav-links ${isMobileMenuOpen ? "active" : ""}`}>
              <li><a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a></li>
              <li><a href="#simulator" onClick={() => setIsMobileMenuOpen(false)}>Launch Pad</a></li>
              <li><a href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a></li>
              {user && (
                <li>
                  <a href="#flight-logs" onClick={() => setIsMobileMenuOpen(false)}>
                    Active Flights ({todos.length})
                  </a>
                </li>
              )}
              <li className="mobile-cta-li">
                {user ? (
                  <button onClick={handleSignOut} className="btn btn-secondary" style={{ width: "100%" }}>
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} className="btn btn-primary" style={{ width: "100%" }}>
                    Sign In
                  </button>
                )}
              </li>
            </ul>

            <div className="nav-cta">
              {user ? (
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                    Pilot: {user.email?.split("@")[0]}
                  </span>
                  <button onClick={handleSignOut} className="btn btn-secondary" style={{ padding: "8px 20px", fontSize: "0.85rem", borderColor: "rgba(255, 107, 0, 0.3)" }}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="btn btn-secondary" style={{ padding: "8px 22px", fontSize: "0.85rem", borderColor: "rgba(255, 107, 0, 0.3)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Sign In
                </button>
              )}
            </div>

            <div className="menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <span style={{ transform: isMobileMenuOpen ? "rotate(45deg) translate(6px, 6px)" : "none", opacity: isMobileMenuOpen ? 0.9 : 1 }} />
              <span style={{ opacity: isMobileMenuOpen ? 0 : 1 }} />
              <span style={{ transform: isMobileMenuOpen ? "rotate(-45deg) translate(5px, -6px)" : "none", opacity: isMobileMenuOpen ? 0.9 : 1 }} />
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              {authSuccess && <div className="auth-success" style={{ marginBottom: "20px" }}>{authSuccess}</div>}
              <div className="badge">
                <div className="badge-pulse" />
                Live: Supabase Auth Enabled
              </div>
              <h1>Crisp Dosas.<br />Delivered at <span className="gradient-text">Mach 2.</span></h1>
              <p className="lead">
                Instant autonomous delivery by thermal-sealed batter-drones. Log in to access the simulator cockpit and launch custom dosa payloads.
              </p>

              <div className="hero-actions">
                <button onClick={() => document.getElementById("simulator")?.scrollIntoView({ behavior: "smooth" })} className="btn btn-primary">
                  <span>Open Cockpit</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
                <a href="#pricing" className="btn btn-secondary">Explore Passes</a>
              </div>

              {/* Metrics Display */}
              <div className="live-board">
                <div className="metric">
                  <div className="metric-value">4,982</div>
                  <div className="metric-label">Delivered Today</div>
                </div>
                <div className="metric">
                  <div className="metric-value">64</div>
                  <div className="metric-label">Active Drones</div>
                </div>
                <div className="metric">
                  <div className="metric-value">4.2m</div>
                  <div className="metric-label">Avg ETA Speed</div>
                </div>
                <div className="metric">
                  <div className="metric-value">82°C</div>
                  <div className="metric-label">Heat Lock</div>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="drone-container">
                <div className="drone-glow" />
                <img src="/airdosa_drone.png" alt="AirDosa High-Speed Delivery Drone" className="drone-image" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header">
            <h2>Precision Dosa Engineering</h2>
            <p>Our autonomous logistics stack is optimized to protect perfect crispness from launchpad to balcony.</p>
          </div>

          <div className="features-grid">
            <div className="glass-card feature-card">
              <div className="feature-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </div>
              <h3>BatterJet™ Thermal Core</h3>
              <p>Ceramic micro-heaters keep internal containment pods at a constant dry 75°C, ensuring zero batter condensation during flights.</p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h3>GyroSambar™ Auto-Level</h3>
              <p>Equipped with active 3-axis brushless stabilizers, keeping hot sambar and chutneys perfectly level at pitch angles up to 45°.</p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                </svg>
              </div>
              <h3>Stratospheric Nodes</h3>
              <p>Networked hovering cloud kitchens position delivery launch windows close to high-density tech hubs and apartments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simulator Section (Launch Pad) */}
      <section className="launch-pad" id="simulator">
        <div className="container">
          <div className="section-header">
            <h2>The Launch Pad</h2>
            <p>Select your configuration parameters and test-launch a virtual payload delivery from our cloud kitchens.</p>
          </div>

          <div className="glass-card simulator-grid" style={{ padding: "40px" }}>
            {/* Customizer Selections */}
            <div className="customizer-form">
              <div>
                <div className="step-title">
                  <span className="step-number">1</span>
                  <span>Select Batter Base</span>
                </div>
                <div className="option-group">
                  <div className={`option-card ${batter === "classic" ? "selected" : ""}`} onClick={() => setBatter("classic")}>
                    <span className="option-title">Classic Golden</span>
                    <span className="option-price">Included</span>
                  </div>
                  <div className={`option-card ${batter === "rava" ? "selected" : ""}`} onClick={() => setBatter("rava")}>
                    <span className="option-title">Rava Crispy</span>
                    <span className="option-price">+₹20</span>
                  </div>
                  <div className={`option-card ${batter === "charcoal" ? "selected" : ""}`} onClick={() => setBatter("charcoal")}>
                    <span className="option-title">Charcoal Jet</span>
                    <span className="option-price">+₹30</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="step-title">
                  <span className="step-number">2</span>
                  <span>Select Inner Core Filling</span>
                </div>
                <div className="option-group">
                  <div className={`option-card ${filling === "Classic Masala" ? "selected" : ""}`} onClick={() => setFilling("Classic Masala")}>
                    <span className="option-title">Spicy Masala</span>
                    <span className="option-price">Included</span>
                  </div>
                  <div className={`option-card ${filling === "Paneer Tikka" ? "selected" : ""}`} onClick={() => setFilling("Paneer Tikka")}>
                    <span className="option-title">Paneer Tikka</span>
                    <span className="option-price">+₹40</span>
                  </div>
                  <div className={`option-card ${filling === "Cheese Schezwan" ? "selected" : ""}`} onClick={() => setFilling("Cheese Schezwan")}>
                    <span className="option-title">Cheese Schezwan</span>
                    <span className="option-price">+₹50</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="step-title">
                  <span className="step-number">3</span>
                  <span>Payload Boosters</span>
                </div>
                <div className="option-group option-group-addons">
                  <div className={`option-card ${addons.gunpowder ? "selected" : ""}`} onClick={() => setAddons({ ...addons, gunpowder: !addons.gunpowder })}>
                    <span className="option-title">Gunpowder Pod</span>
                    <span className="option-price">+₹15</span>
                  </div>
                  <div className={`option-card ${addons.sambar ? "selected" : ""}`} onClick={() => setAddons({ ...addons, sambar: !addons.sambar })}>
                    <span className="option-title">Sambar Booster</span>
                    <span className="option-price">+₹10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customizer Visualizer & Submit */}
            <div className="glass-card visualizer-card">
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="metric-label" style={{ color: "var(--accent-teal)" }}>Visualizer active</span>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent-teal)", boxShadow: "var(--shadow-teal)" }} />
              </div>

              <div className="visualizer-display">
                <div className="radar-line" />
                <div className="dosa-steam">
                  <div className="steam-particle" />
                  <div className="steam-particle" />
                  <div className="steam-particle" />
                </div>
                <div className={`dosa-render ${batter === "rava" ? "batter-effect-rava" : batter === "charcoal" ? "batter-effect-charcoal" : ""}`} />
                <div className="filling-badge">{filling} Core</div>
              </div>

              <div className="summary-box">
                <div className="summary-row">
                  <span>Configured Cargo:</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{summaryName}</span>
                </div>
                <div className="summary-row">
                  <span>Pilot Status:</span>
                  {user ? (
                    <span style={{ color: "#00ffaa" }}>Authenticated ({user.email?.split("@")[0]})</span>
                  ) : (
                    <span style={{ color: "var(--accent-pink)" }}>Logged Out (Guest)</span>
                  )}
                </div>
                <div className="summary-row summary-total">
                  <span>Total Payload Cost:</span>
                  <span className="gradient-text">₹{price}</span>
                </div>

                <button onClick={handleLaunchSimulator} className="btn btn-primary" style={{ width: "100%", marginTop: "15px" }}>
                  {!user ? "🔒 Authenticate Pilot" : "LAUNCH DRONE FLIGHT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flight History Log Dashboard (Visible when logged in) */}
      {user && (
        <section className="features" id="flight-logs" style={{ paddingTop: "0" }}>
          <div className="container">
            <div className="glass-card" style={{ maxWidth: "600px", margin: "0 auto", borderColor: "rgba(0, 242, 254, 0.25)" }}>
              <h3 style={{ fontSize: "1.4rem", color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent-teal)", animation: "pulse-ring 1.5s infinite" }} />
                Pilot Flight Logs History
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "15px" }}>
                Past launcher launches recorded under this account in the Supabase db.
              </p>

              {todos.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
                  No flight records found. Configure a payload above and click Launch!
                </p>
              ) : (
                <div className="flights-list">
                  {todos.map((todo) => (
                    <div key={todo.id} className="flight-item">
                      <span className="flight-item-title">{todo.name}</span>
                      <span>#{todo.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Suborbital passes</h2>
            <p>Choose a pilot program subscription to secure breakfast slot reservations.</p>
          </div>

          <div className="pricing-grid">
            <div className="glass-card pricing-card">
              <div>
                <h3 className="plan-title">Single Launch</h3>
                <p className="plan-desc">For the weekend warrior or casual dosa fan.</p>
                <div className="plan-price">
                  <span className="plan-price-val">₹199</span>
                  <span className="plan-price-period">/ month</span>
                </div>
                <ul className="plan-features">
                  <li>✔ 3 Priority Launches/mo</li>
                  <li>✔ Classic Masala/Sada options</li>
                  <li>✔ Standard 10-minute ETA</li>
                  <li>✔ Spill-guard active stabilizer</li>
                </ul>
              </div>
              <button onClick={() => document.getElementById("simulator")?.scrollIntoView({ behavior: "smooth" })} className="btn btn-secondary" style={{ width: "100%", marginTop: "30px" }}>
                Get Started
              </button>
            </div>

            <div className="glass-card pricing-card premium">
              <div>
                <h3 className="plan-title">Mach Speed Pass</h3>
                <p className="plan-desc">For high-intensity technical offices or heavy consumers.</p>
                <div className="plan-price">
                  <span className="plan-price-val">₹599</span>
                  <span className="plan-price-period">/ month</span>
                </div>
                <ul className="plan-features">
                  <li>✔ <strong>Unlimited priority flights</strong></li>
                  <li>✔ Unleash Rava and Charcoal batters</li>
                  <li>✔ 4-minute priority ETA queue</li>
                  <li>✔ Dual-drone deployment options</li>
                </ul>
              </div>
              <button onClick={() => document.getElementById("simulator")?.scrollIntoView({ behavior: "smooth" })} className="btn btn-primary" style={{ width: "100%", marginTop: "30px" }}>
                Get Pass
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-logo-desc">
              <a href="#" className="brand">
                <div className="brand-logo">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <span className="brand-name">AirDosa</span>
              </a>
              <p>Hot South Indian food tech. Mach-speed deliveries. Sambar balancing. Perfect crispness guaranteed.</p>
            </div>

            <div className="footer-links">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Research Lab</a></li>
                <li><a href="#">Flight Careers</a></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Tech Specs</h4>
              <ul>
                <li><a href="#">BatterJet™</a></li>
                <li><a href="#">Gimbals</a></li>
                <li><a href="#">AI Flight control</a></li>
              </ul>
            </div>

            <div className="footer-newsletter">
              <h4>Launch Alerts</h4>
              <p>Get coordinates when hovering towers launch above your residential block.</p>
              <div className="newsletter-form">
                <input type="email" placeholder="sector email" className="newsletter-input" />
                <button className="newsletter-btn">🚀</button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div>© 2026 AirDosa Technologies Inc. Ground Control.</div>
          </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <button onClick={() => document.getElementById("simulator")?.scrollIntoView({ behavior: "smooth" })} className="floating-cta" aria-label="Order Now">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </button>

      {/* Auth Modal Overlay */}
      <div className={`auth-modal ${isAuthModalOpen ? "active" : ""}`}>
        <div className="auth-card">
          <button className="close-modal" onClick={() => setIsAuthModalOpen(false)}>×</button>

          <div className="auth-tabs">
            <button className={`auth-tab ${authTab === "signin" ? "active" : ""}`} onClick={() => { setAuthTab("signin"); setAuthError(null); }}>
              Sign In
            </button>
            <button className={`auth-tab ${authTab === "signup" ? "active" : ""}`} onClick={() => { setAuthTab("signup"); setAuthError(null); }}>
              Sign Up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authError && <div className="auth-error">{authError}</div>}
            
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pilot@airdosa.com" />
            </div>

            <div className="form-group">
              <label>Cockpit Password</label>
              <input type="password" className="form-input" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }} disabled={isPending}>
              {isPending ? "Connecting to Base..." : authTab === "signin" ? "Enter Cockpit" : "Register Pilot"}
            </button>
          </form>
        </div>
      </div>

      {/* Flight Tracking Simulator Modal */}
      <div className={`simulator-modal ${isFlightModalOpen ? "active" : ""}`}>
        {flightPhase === "loading" ? (
          <div className="modal-content">
            <button className="close-modal" onClick={() => setIsFlightModalOpen(false)}>×</button>
            <h3 className="modal-title">Flight Simulator: <span className="gradient-text">Drone Launched!</span></h3>
            
            <div className="flight-tracker">
              <div className="tracker-grid-overlay" />
              <div className="tracker-kitchen">🏪</div>
              <div className="tracker-path">
                <div className="tracker-progress-line" style={{ width: `${flightProgress}%` }} />
              </div>
              <div className="tracker-icon" style={{ left: `${10 + flightProgress * 0.8}%` }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div className="tracker-destination">📍</div>
            </div>

            <div className="console-log">
              {consoleLogs.map((log, index) => (
                <div key={index} className={`console-line ${log.type === "saffron" ? "saffron" : log.type === "success" ? "success" : ""}`}>
                  {log.text}
                </div>
              ))}
            </div>

            <button className="btn btn-secondary" onClick={() => setIsFlightModalOpen(false)}>Abort Flight</button>
          </div>
        ) : (
          <div className="modal-content">
            <button className="close-modal" onClick={() => setIsFlightModalOpen(false)}>×</button>
            <div className="success-banner" style={{ display: "flex" }}>
              <div className="success-icon-large">🎉</div>
              <h3 className="modal-title" style={{ marginBottom: "8px" }}>Dosa Delivered Successfully!</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "24px", maxWidth: "450px" }}>
                Your custom thermal capsule was verified as landed on your balcony landing pad. Flight log added to your Supabase logs list.
              </p>
              <button className="btn btn-primary" onClick={() => setIsFlightModalOpen(false)}>Complete Simulation</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
