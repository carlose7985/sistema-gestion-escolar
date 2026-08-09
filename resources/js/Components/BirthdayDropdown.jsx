import React, { useState, useEffect, useRef } from "react";
import { usePage, Link } from "@inertiajs/react";
import axios from "axios";
import { Cake, Loader2, PartyPopper, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BirthdayDropdown() {
    const { birthdays_count } = usePage().props;
    const [birthdays, setBirthdays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (isOpen && birthdays_count > 0 && birthdays.length === 0) {
            setLoading(true);
            axios.get(route("api.birthdays")).then((res) => {
                setBirthdays(res.data);
                setLoading(false);
            });
        }
    }, [isOpen]);

    useEffect(() => {
        const out = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            )
                setIsOpen(false);
        };
        document.addEventListener("mousedown", out);
        return () => document.removeEventListener("mousedown", out);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => birthdays_count > 0 && setIsOpen(!isOpen)}
                className={`p-2.5 rounded-xl transition-all relative border ${
                    birthdays_count > 0
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white"
                        : "bg-slate-800/40 border-slate-700 text-slate-600 cursor-not-allowed"
                }`}
            >
                <Cake size={18} />
                {birthdays_count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white ring-2 ring-[#0b0f1a] animate-bounce">
                        {birthdays_count}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-96 bg-[#161d2e] border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden z-[100] backdrop-blur-xl"
                    >
                        <div className="bg-gradient-to-r from-amber-500 to-rose-600 p-4 text-center text-white">
                            <PartyPopper
                                className="mx-auto mb-1 animate-bounce"
                                size={20}
                            />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">
                                ¡Cumpleañeros de hoy!
                            </h4>
                        </div>
                        <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="p-6 text-center">
                                    <Loader2 className="animate-spin mx-auto text-amber-500" />
                                </div>
                            ) : (
                                birthdays.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/50 transition-all mb-1"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-[10px] font-black text-amber-500 border border-amber-500/20">
                                                {item.initials}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white uppercase leading-none">
                                                    {item.name}
                                                </p>
                                                <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">
                                                    {item.cargo}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                                                {item.age} Años
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
