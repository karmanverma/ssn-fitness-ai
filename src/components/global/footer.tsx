'use client';

export default function Footer() {
    return (
        <footer className="relative z-10 mt-8 w-full overflow-hidden pt-16 pb-8">
            <style jsx global>{`
        .glass {
          backdrop-filter: blur(3px) saturate(180%);
          background: radial-gradient(circle, #fff9 0%, #ffdce64d 60%, #f9f2f4 100%);
          border: 1px solid #ff96b41a;
          justify-content: center;
          align-items: center;
          transition: all .3s;
          display: flex;
        }
        .glass:where(.dark, .dark *) {
          display: flex
          backdrop-filter: blur(2px) !important;
          background: radial-gradient(circle, #ffffff1a 0%, #1e00001a 60%, #2a0e0e 100%) !important;
          border: 1px solid #ffffff0d !important;
          border-radius: 16px !important;
          justify-content: center !important;
          align-items: center !important;
        }
      `}</style>
            <div className="pointer-events-none absolute top-0 left-1/2 z-0 h-full w-full -translate-x-1/2 select-none">
                <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-rose-600/20 blur-3xl"></div>
                <div className="absolute right-1/4 -bottom-24 h-80 w-80 rounded-full bg-rose-600/20 blur-3xl"></div>
            </div>
            <div className="glass relative mx-auto flex max-w-6xl flex-col items-center gap-8 rounded-2xl px-6 py-10 md:flex-row md:items-start md:justify-between md:gap-12">
                <div className="flex flex-col items-center md:items-start">
                    <a href="/" className="mb-4 flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-700 text-2xl font-extrabold text-white shadow-md">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                />
                            </svg>
                        </span>
                        <span className="bg-gradient-to-br from-rose-200 to-rose-500 bg-clip-text text-xl font-semibold tracking-tight text-transparent">
                            SSN Fitness
                        </span>
                    </a>
                    <p className="text-foreground mb-6 max-w-xs text-center text-sm md:text-left">
                        Your complete fitness companion offering personalized consultations,
                        custom workout plans, expert supplement guidance, and powerful health tracking tools.
                    </p>
                    <div className="mt-2 flex gap-3 text-rose-400">
                        <a
                            href="#"
                            aria-label="Twitter"
                            className="hover:text-foreground transition"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.633 7.997c.013.176.013.353.013.53 0 5.387-4.099 11.605-11.604 11.605A11.561 11.561 0 010 18.29c.373.044.734.074 1.12.074a8.189 8.189 0 005.065-1.737 4.102 4.102 0 01-3.834-2.85c.25.04.5.065.765.065.37 0 .734-.049 1.08-.147A4.092 4.092 0 01.8 8.582v-.05a4.119 4.119 0 001.853.522A4.099 4.099 0 01.812 5.847c0-.02 0-.042.002-.062a11.653 11.653 0 008.457 4.287A4.62 4.62 0 0122 5.924a8.215 8.215 0 002.018-.559 4.108 4.108 0 01-1.803 2.268 8.233 8.233 0 002.368-.648 8.897 8.897 0 01-2.062 2.112z" />
                            </svg>
                        </a>
                        <a
                            href="#"
                            aria-label="Instagram"
                            className="hover:text-foreground transition"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>
                        <a
                            href="#"
                            aria-label="YouTube"
                            className="hover:text-foreground transition"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </a>
                    </div>
                </div>
                <nav className="flex w-full flex-col gap-9 text-center md:w-auto md:flex-row md:justify-end md:text-left">
                    <div>
                        <div className="mb-3 text-xs font-semibold tracking-widest text-rose-400 uppercase">
                            Services
                        </div>
                        <ul className="space-y-2">
                            <li>
                                <a href="/consult" className="text-foreground/70 hover:text-foreground transition">
                                    AI Consultation
                                </a>
                            </li>
                            <li>
                                <a href="/service" className="text-foreground/70 hover:text-foreground transition">
                                    Workout Plans
                                </a>
                            </li>
                            <li>
                                <a href="/report" className="text-foreground/70 hover:text-foreground transition">
                                    Health Reports
                                </a>
                            </li>
                            <li>
                                <a href="/profile" className="text-foreground/70 hover:text-foreground transition">
                                    Profile
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <div className="mb-3 text-xs font-semibold tracking-widest text-rose-400 uppercase">
                            Company
                        </div>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                                    Careers
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <div className="mb-3 text-xs font-semibold tracking-widest text-rose-400 uppercase">
                            Resources
                        </div>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                                    Docs
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                                    Community
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                                    Support
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-foreground/70 hover:text-foreground transition">
                                    Privacy
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
            <div className="text-foreground relative z-10 mt-10 text-center text-xs">
                <span>&copy; 2025 SSN Fitness. All rights reserved.</span>
            </div>
        </footer>
    );
}