import React from 'react';

export const LandingFooter: React.FC = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-12 border-t border-ns-ink mt-auto text-ns-ink font-sans">
            <div className="col-span-2 md:col-span-12 border-b border-r border-ns-ink h-4 bg-ns-ink opacity-10"></div>

            {/* Footer Nav */}
            <div className="col-span-1 md:col-span-3 border-r border-ns-ink p-6 font-mono text-[10px] uppercase">
                <ul className="space-y-3">
                    <li><a href="#" className="hover:bg-ns-ink hover:text-ns-paper px-1 -ml-1 transition-colors">Facebook</a></li>
                    <li><a href="#" className="hover:bg-ns-ink hover:text-ns-paper px-1 -ml-1 transition-colors">Instagram</a></li>
                    <li><a href="#" className="hover:bg-ns-ink hover:text-ns-paper px-1 -ml-1 transition-colors">Twitter / X</a></li>
                </ul>
            </div>

            <div className="col-span-1 md:col-span-3 border-r border-ns-ink p-6 font-mono text-[10px] uppercase">
                <ul className="space-y-3">
                    <li><a href="#" className="hover:bg-ns-ink hover:text-ns-paper px-1 -ml-1 transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:bg-ns-ink hover:text-ns-paper px-1 -ml-1 transition-colors">Terms of Service</a></li>
                    <li><a href="#" className="hover:bg-ns-ink hover:text-ns-paper px-1 -ml-1 transition-colors">Sitemap</a></li>
                </ul>
            </div>

            <div className="col-span-2 md:col-span-6 p-6 flex items-center justify-end bg-ns-ink text-ns-paper">
                <div className="text-right">
                    <p className="font-sans font-bold text-3xl md:text-5xl uppercase leading-none mb-2">
                        Secure<br />The<br />Future
                    </p>
                    <p className="font-mono text-[9px] opacity-60">
                        © 2024 NANOSECOND LABS
                    </p>
                </div>
            </div>
        </div>
    );
};
